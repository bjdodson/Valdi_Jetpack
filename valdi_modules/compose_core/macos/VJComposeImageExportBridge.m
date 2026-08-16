#import <AppKit/AppKit.h>
#import <ImageIO/ImageIO.h>
#import <string.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

#import "valdi/macos/SCValdiMacOSAttributesBinder.h"
#import "valdi/macos/SCValdiMacOSFunction.h"

static const NSUInteger VJComposeMaximumImageBytes = 256 * 1024 * 1024;
static const unsigned long long VJComposeMaximumImagePixels = 100ULL * 1000ULL * 1000ULL;

static void VJComposeRemoveTemporaryURL(NSURL *temporaryURL)
{
    if (!temporaryURL) {
        return;
    }
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_UTILITY, 0), ^{
        [[NSFileManager defaultManager] removeItemAtURL:temporaryURL error:nil];
    });
}

@class VJComposeImageExportBridge;

@interface VJComposeImageExportSessionDelegate : NSObject <NSURLSessionDataDelegate>
@property(nonatomic, weak) VJComposeImageExportBridge *owner;
@end

@interface VJComposeImageExportBridge : NSView <NSURLSessionDataDelegate>
@end

@implementation VJComposeImageExportBridge {
    NSString *_command;
    NSString *_source;
    NSString *_suggestedFileName;
    NSString *_request;
    NSString *_lastStartedRequest;
    NSString *_activeRequest;
    NSUInteger _configurationGeneration;
    NSUInteger _nextExecutionGeneration;
    NSUInteger _activeExecutionGeneration;
    SCValdiMacOSFunction *_onResult;

    NSURLSession *_session;
    VJComposeImageExportSessionDelegate *_sessionDelegate;
    NSURLSessionDataTask *_dataTask;
    NSMutableData *_receivedData;
    NSString *_networkRequest;
    NSString *_networkSuggestedFileName;
    NSUInteger _networkExecutionGeneration;
    NSSavePanel *_savePanel;
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder
{
    // Command is one JSON value so Valdi's unspecified attribute-setter order
    // cannot pair a new request with an old source or filename.
    [attributesBinder bindUntypedAttribute:@"command"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setCommand:)];
    [attributesBinder bindUntypedAttribute:@"onResult"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setOnResult:)];
}

- (void)dealloc
{
    [self vj_invalidateActiveRequest];
}

- (void)vj_setCommand:(id)value
{
    NSString *command = [value isKindOfClass:[NSString class]] ? value : nil;
    if (command.length == 0) {
        _command = nil;
        _source = nil;
        _suggestedFileName = nil;
        _request = nil;
        _lastStartedRequest = nil;
        [self vj_invalidateActiveRequest];
        [self vj_scheduleCurrentCommand];
        return;
    }
    if ([_command isEqualToString:command]) {
        [self vj_scheduleCurrentCommand];
        return;
    }

    NSData *jsonData = [command dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *payload = jsonData
        ? [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:nil]
        : nil;
    NSString *request = [payload isKindOfClass:[NSDictionary class]] &&
                                [payload[@"request"] isKindOfClass:[NSString class]]
        ? payload[@"request"]
        : nil;
    NSString *source = [payload isKindOfClass:[NSDictionary class]] &&
                               [payload[@"source"] isKindOfClass:[NSString class]]
        ? payload[@"source"]
        : nil;
    NSString *suggestedFileName = [payload isKindOfClass:[NSDictionary class]] &&
                                          [payload[@"suggestedFileName"] isKindOfClass:[NSString class]]
        ? payload[@"suggestedFileName"]
        : nil;
    NSNumber *version = [payload isKindOfClass:[NSDictionary class]] &&
                                [payload[@"version"] isKindOfClass:[NSNumber class]]
        ? payload[@"version"]
        : nil;

    [self vj_invalidateActiveRequest];
    _command = [command copy];
    _source = version.integerValue == 1 ? [source copy] : nil;
    _suggestedFileName = version.integerValue == 1 ? [suggestedFileName copy] : nil;
    _request = version.integerValue == 1 ? [request copy] : nil;
    _lastStartedRequest = nil;
    [self vj_scheduleCurrentCommand];
}

- (void)vj_setOnResult:(id)value
{
    _onResult = [value isKindOfClass:[SCValdiMacOSFunction class]] ? value : nil;
    [self vj_scheduleCurrentCommand];
}

- (void)vj_scheduleCurrentCommand
{
    NSUInteger configurationGeneration = ++_configurationGeneration;
    __weak VJComposeImageExportBridge *weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        // A second turn coalesces all attributes Valdi reapplies from its
        // internal unordered map before the side-effecting command begins.
        dispatch_async(dispatch_get_main_queue(), ^{
            VJComposeImageExportBridge *strongSelf = weakSelf;
            if (!strongSelf || strongSelf->_configurationGeneration != configurationGeneration) {
                return;
            }
            [strongSelf vj_beginCurrentCommand];
        });
    });
}

- (void)vj_beginCurrentCommand
{
    NSString *request = [_request copy];
    NSString *source = [_source copy];
    if (!_onResult || request.length == 0 || source.length == 0 ||
        [_lastStartedRequest isEqualToString:request]) {
        return;
    }

    _lastStartedRequest = request;
    _activeRequest = request;
    NSUInteger executionGeneration = ++_nextExecutionGeneration;
    _activeExecutionGeneration = executionGeneration;

    NSString *operation = [self vj_operationForRequest:request];
    if (!operation) {
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"failed"
                           reason:@"unsupported-operation"
                          message:@"The requested export action is unsupported."];
        return;
    }
    [self vj_loadSource:source
                request:request
    executionGeneration:executionGeneration
      suggestedFileName:_suggestedFileName.length > 0 ? _suggestedFileName : @"image.jpg"];
}

- (BOOL)vj_isCurrentRequest:(NSString *)request executionGeneration:(NSUInteger)executionGeneration
{
    return request.length > 0 &&
           [_activeRequest isEqualToString:request] &&
           _activeExecutionGeneration == executionGeneration;
}

- (void)vj_invalidateActiveRequest
{
    _nextExecutionGeneration += 1;
    _activeRequest = nil;
    _activeExecutionGeneration = 0;

    NSURLSessionDataTask *task = _dataTask;
    NSURLSession *session = _session;
    _sessionDelegate.owner = nil;
    _sessionDelegate = nil;
    _dataTask = nil;
    _session = nil;
    _receivedData = nil;
    _networkRequest = nil;
    _networkSuggestedFileName = nil;
    _networkExecutionGeneration = 0;
    [task cancel];
    [session invalidateAndCancel];

    NSSavePanel *panel = _savePanel;
    _savePanel = nil;
    [panel cancel:nil];
}

- (void)vj_loadSource:(NSString *)source
               request:(NSString *)request
   executionGeneration:(NSUInteger)executionGeneration
     suggestedFileName:(NSString *)suggestedFileName
{
    NSURL *url = [NSURL URLWithString:source];
    if (!url) {
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"failed"
                           reason:@"invalid-source"
                          message:@"The image source is invalid."];
        return;
    }

    if (url.isFileURL) {
        NSNumber *fileSize = nil;
        NSError *sizeError = nil;
        if (![url getResourceValue:&fileSize forKey:NSURLFileSizeKey error:&sizeError]) {
            [self vj_completeRequest:request
                 executionGeneration:executionGeneration
                              outcome:@"failed"
                               reason:@"load-failed"
                              message:@"The image could not be read."];
            return;
        }
        if (fileSize.unsignedLongLongValue > VJComposeMaximumImageBytes) {
            [self vj_completeRequest:request
                 executionGeneration:executionGeneration
                              outcome:@"failed"
                               reason:@"size-limit"
                              message:@"The image exceeds the export size limit."];
            return;
        }

        __weak VJComposeImageExportBridge *weakSelf = self;
        dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
            NSError *readError = nil;
            NSData *data = [NSData dataWithContentsOfURL:url options:NSDataReadingMappedIfSafe error:&readError];
            dispatch_async(dispatch_get_main_queue(), ^{
                VJComposeImageExportBridge *strongSelf = weakSelf;
                if (!strongSelf || ![strongSelf vj_isCurrentRequest:request
                                                     executionGeneration:executionGeneration]) {
                    return;
                }
                if (readError) {
                    [strongSelf vj_completeRequest:request
                               executionGeneration:executionGeneration
                                            outcome:@"failed"
                                             reason:@"load-failed"
                                            message:@"The image could not be read."];
                    return;
                }
                [strongSelf vj_handleData:data
                                  request:request
                      executionGeneration:executionGeneration
                        suggestedFileName:suggestedFileName];
            });
        });
        return;
    }

    NSString *scheme = url.scheme.lowercaseString;
    if (![scheme isEqualToString:@"http"] && ![scheme isEqualToString:@"https"]) {
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"failed"
                           reason:@"invalid-source"
                          message:@"This image source cannot be exported."];
        return;
    }

    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration ephemeralSessionConfiguration];
    configuration.HTTPCookieAcceptPolicy = NSHTTPCookieAcceptPolicyNever;
    configuration.HTTPShouldSetCookies = NO;
    configuration.URLCache = nil;
    configuration.requestCachePolicy = NSURLRequestReloadIgnoringLocalCacheData;
    _sessionDelegate = [[VJComposeImageExportSessionDelegate alloc] init];
    _sessionDelegate.owner = self;
    _session = [NSURLSession sessionWithConfiguration:configuration
                                             delegate:_sessionDelegate
                                        delegateQueue:[NSOperationQueue mainQueue]];
    _receivedData = [NSMutableData data];
    _networkRequest = request;
    _networkSuggestedFileName = suggestedFileName;
    _networkExecutionGeneration = executionGeneration;
    _dataTask = [_session dataTaskWithURL:url];
    [_dataTask resume];
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
didReceiveResponse:(NSURLResponse *)response
 completionHandler:(void (^)(NSURLSessionResponseDisposition disposition))completionHandler
{
    NSString *request = [_networkRequest copy];
    NSUInteger executionGeneration = _networkExecutionGeneration;
    BOOL current = session == _session && dataTask == _dataTask &&
        [self vj_isCurrentRequest:request executionGeneration:executionGeneration];
    NSInteger status = [response isKindOfClass:[NSHTTPURLResponse class]]
        ? ((NSHTTPURLResponse *)response).statusCode
        : 0;
    NSString *finalScheme = response.URL.scheme.lowercaseString;
    long long expectedLength = response.expectedContentLength;
    BOOL validResponse = current &&
        status >= 200 && status < 300 &&
        ([finalScheme isEqualToString:@"http"] || [finalScheme isEqualToString:@"https"]);
    BOOL tooLarge = expectedLength > (long long)VJComposeMaximumImageBytes;
    if (!validResponse || tooLarge) {
        completionHandler(NSURLSessionResponseCancel);
        [self vj_clearNetworkStateForTask:dataTask cancel:YES];
        if (current) {
            [self vj_completeRequest:request
                 executionGeneration:executionGeneration
                              outcome:@"failed"
                               reason:tooLarge ? @"size-limit" : @"load-failed"
                              message:tooLarge
                                  ? @"The image exceeds the export size limit."
                                  : @"The image could not be loaded for export."];
        }
        return;
    }
    completionHandler(NSURLSessionResponseAllow);
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data
{
    NSString *request = [_networkRequest copy];
    NSUInteger executionGeneration = _networkExecutionGeneration;
    if (session != _session || dataTask != _dataTask ||
        ![self vj_isCurrentRequest:request executionGeneration:executionGeneration]) {
        return;
    }
    if (_receivedData.length > VJComposeMaximumImageBytes ||
        data.length > VJComposeMaximumImageBytes - _receivedData.length) {
        [self vj_clearNetworkStateForTask:dataTask cancel:YES];
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"failed"
                           reason:@"size-limit"
                          message:@"The image exceeds the export size limit."];
        return;
    }
    [_receivedData appendData:data];
}

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didCompleteWithError:(NSError *)error
{
    if (session != _session || task != _dataTask) {
        return;
    }
    NSString *request = [_networkRequest copy];
    NSString *suggestedFileName = [_networkSuggestedFileName copy];
    NSUInteger executionGeneration = _networkExecutionGeneration;
    NSData *data = [_receivedData copy];
    [self vj_clearNetworkStateForTask:(NSURLSessionDataTask *)task cancel:NO];
    if (![self vj_isCurrentRequest:request executionGeneration:executionGeneration]) {
        return;
    }
    if (error) {
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"failed"
                           reason:@"load-failed"
                          message:@"The image could not be loaded for export."];
        return;
    }
    [self vj_handleData:data
                request:request
    executionGeneration:executionGeneration
      suggestedFileName:suggestedFileName];
}

- (void)vj_clearNetworkStateForTask:(NSURLSessionDataTask *)task cancel:(BOOL)cancel
{
    if (task != _dataTask) {
        return;
    }
    NSURLSession *session = _session;
    _sessionDelegate.owner = nil;
    _sessionDelegate = nil;
    _dataTask = nil;
    _session = nil;
    _receivedData = nil;
    _networkRequest = nil;
    _networkSuggestedFileName = nil;
    _networkExecutionGeneration = 0;
    if (cancel) {
        [task cancel];
        [session invalidateAndCancel];
    } else {
        [session finishTasksAndInvalidate];
    }
}

- (void)vj_handleData:(NSData *)data
               request:(NSString *)request
   executionGeneration:(NSUInteger)executionGeneration
     suggestedFileName:(NSString *)suggestedFileName
{
    if (![self vj_isCurrentRequest:request executionGeneration:executionGeneration]) {
        return;
    }
    if (data.length == 0 || data.length > VJComposeMaximumImageBytes) {
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"failed"
                           reason:@"size-limit"
                          message:@"The image data is empty or too large."];
        return;
    }

    NSString *extension = [self vj_extensionForData:data];
    if (!extension || ![self vj_hasSafePixelDimensions:data]) {
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"failed"
                           reason:@"invalid-image"
                          message:@"Only valid, reasonably sized JPEG and PNG images can be exported."];
        return;
    }

    NSString *fileName = [self vj_safeFileName:suggestedFileName extension:extension];
    NSString *operation = [self vj_operationForRequest:request];
    if ([operation isEqualToString:@"copy"]) {
        if (![self vj_isCurrentRequest:request executionGeneration:executionGeneration]) {
            return;
        }
        NSImage *image = [[NSImage alloc] initWithData:data];
        NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
        [pasteboard clearContents];
        if (!image || ![pasteboard writeObjects:@[image]]) {
            [self vj_completeRequest:request
                 executionGeneration:executionGeneration
                              outcome:@"failed"
                               reason:@"clipboard-failed"
                              message:@"The image could not be copied."];
            return;
        }
        [self vj_completeRequest:request
             executionGeneration:executionGeneration
                          outcome:@"success"
                           reason:@"copied"
                          message:@"Copied the image."];
        return;
    }

    if ([operation isEqualToString:@"downloads"]) {
        NSURL *downloads = [[[NSFileManager defaultManager] URLsForDirectory:NSDownloadsDirectory
                                                                   inDomains:NSUserDomainMask] firstObject];
        if (!downloads) {
            [self vj_completeRequest:request
                 executionGeneration:executionGeneration
                              outcome:@"failed"
                               reason:@"downloads-unavailable"
                              message:@"The Downloads folder is unavailable."];
            return;
        }
        [self vj_prepareDownloadsData:data
                           directory:downloads
                            fileName:fileName
                             request:request
                 executionGeneration:executionGeneration];
        return;
    }

    if ([operation isEqualToString:@"save-as"]) {
        if (![self vj_isCurrentRequest:request executionGeneration:executionGeneration]) {
            return;
        }
        NSSavePanel *panel = [NSSavePanel savePanel];
        _savePanel = panel;
        panel.title = @"Save image";
        panel.nameFieldStringValue = fileName;
        if (@available(macOS 11.0, *)) {
            panel.allowedContentTypes = @[[extension isEqualToString:@"png"] ? UTTypePNG : UTTypeJPEG];
        } else {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
            panel.allowedFileTypes = @[[extension isEqualToString:@"png"] ? @"png" : @"jpg"];
#pragma clang diagnostic pop
        }
        __weak VJComposeImageExportBridge *weakSelf = self;
        void (^completion)(NSModalResponse) = ^(NSModalResponse result) {
            VJComposeImageExportBridge *strongSelf = weakSelf;
            if (!strongSelf || strongSelf->_savePanel != panel ||
                ![strongSelf vj_isCurrentRequest:request executionGeneration:executionGeneration]) {
                return;
            }
            strongSelf->_savePanel = nil;
            NSURL *destination = panel.URL;
            if (result != NSModalResponseOK || !destination.isFileURL) {
                [strongSelf vj_completeRequest:request
                           executionGeneration:executionGeneration
                                        outcome:@"cancelled"
                                         reason:@"cancelled"
                                        message:@"Save cancelled."];
                return;
            }
            [strongSelf vj_prepareSaveAsData:data
                                  destination:destination
                                      request:request
                          executionGeneration:executionGeneration];
        };
        if (self.window) {
            [panel beginSheetModalForWindow:self.window completionHandler:completion];
        } else {
            [panel beginWithCompletionHandler:completion];
        }
        return;
    }

    [self vj_completeRequest:request
         executionGeneration:executionGeneration
                      outcome:@"failed"
                       reason:@"unsupported-operation"
                      message:@"The requested export action is unsupported."];
}

- (void)vj_prepareDownloadsData:(NSData *)data
                       directory:(NSURL *)directory
                        fileName:(NSString *)fileName
                         request:(NSString *)request
             executionGeneration:(NSUInteger)executionGeneration
{
    NSURL *temporaryURL = [directory URLByAppendingPathComponent:
        [NSString stringWithFormat:@".vj-export-%@.tmp", [NSUUID UUID].UUIDString]];
    __weak VJComposeImageExportBridge *weakSelf = self;
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        NSError *writeError = nil;
        BOOL wrote = [data writeToURL:temporaryURL options:NSDataWritingAtomic error:&writeError];
        dispatch_async(dispatch_get_main_queue(), ^{
            VJComposeImageExportBridge *strongSelf = weakSelf;
            if (!strongSelf || ![strongSelf vj_isCurrentRequest:request
                                                     executionGeneration:executionGeneration]) {
                VJComposeRemoveTemporaryURL(temporaryURL);
                return;
            }
            if (!wrote) {
                VJComposeRemoveTemporaryURL(temporaryURL);
                [strongSelf vj_completeRequest:request
                           executionGeneration:executionGeneration
                                        outcome:@"failed"
                                         reason:@"write-failed"
                                        message:@"The image could not be saved to Downloads."];
                return;
            }

            NSFileManager *fileManager = [NSFileManager defaultManager];
            NSURL *publishedURL = nil;
            NSError *publishError = nil;
            NSString *baseName = fileName.stringByDeletingPathExtension;
            NSString *extension = fileName.pathExtension;
            for (NSUInteger suffix = 1; suffix < 10000; suffix++) {
                NSString *candidateName = suffix == 1
                    ? fileName
                    : [[NSString stringWithFormat:@"%@-%lu", baseName, (unsigned long)suffix]
                        stringByAppendingPathExtension:extension];
                NSURL *candidate = [directory URLByAppendingPathComponent:candidateName];
                publishError = nil;
                if ([fileManager linkItemAtURL:temporaryURL toURL:candidate error:&publishError]) {
                    publishedURL = candidate;
                    break;
                }
                if (![publishError.domain isEqualToString:NSCocoaErrorDomain] ||
                    publishError.code != NSFileWriteFileExistsError) {
                    break;
                }
            }
            VJComposeRemoveTemporaryURL(temporaryURL);
            if (!publishedURL) {
                [strongSelf vj_completeRequest:request
                           executionGeneration:executionGeneration
                                        outcome:@"failed"
                                         reason:@"write-failed"
                                        message:@"The image could not be saved to Downloads."];
                return;
            }
            [strongSelf vj_completeRequest:request
                       executionGeneration:executionGeneration
                                    outcome:@"success"
                                     reason:@"saved-downloads"
                                    message:[NSString stringWithFormat:@"Saved to Downloads as %@.",
                                                                     publishedURL.lastPathComponent]];
        });
    });
}

- (void)vj_prepareSaveAsData:(NSData *)data
                   destination:(NSURL *)destination
                       request:(NSString *)request
           executionGeneration:(NSUInteger)executionGeneration
{
    NSURL *directory = [destination URLByDeletingLastPathComponent];
    NSURL *temporaryURL = [directory URLByAppendingPathComponent:
        [NSString stringWithFormat:@".vj-export-%@.tmp", [NSUUID UUID].UUIDString]];
    __weak VJComposeImageExportBridge *weakSelf = self;
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        NSError *writeError = nil;
        BOOL wrote = [data writeToURL:temporaryURL options:NSDataWritingAtomic error:&writeError];
        dispatch_async(dispatch_get_main_queue(), ^{
            VJComposeImageExportBridge *strongSelf = weakSelf;
            if (!strongSelf || ![strongSelf vj_isCurrentRequest:request
                                                     executionGeneration:executionGeneration]) {
                VJComposeRemoveTemporaryURL(temporaryURL);
                return;
            }
            NSError *publishError = nil;
            NSFileManager *fileManager = [NSFileManager defaultManager];
            BOOL published = wrote;
            if (published && [fileManager fileExistsAtPath:destination.path]) {
                NSURL *resultingURL = nil;
                published = [fileManager replaceItemAtURL:destination
                                             withItemAtURL:temporaryURL
                                            backupItemName:nil
                                                   options:0
                                          resultingItemURL:&resultingURL
                                                     error:&publishError];
            } else if (published) {
                published = [fileManager moveItemAtURL:temporaryURL toURL:destination error:&publishError];
            }
            if (!published) {
                VJComposeRemoveTemporaryURL(temporaryURL);
                [strongSelf vj_completeRequest:request
                           executionGeneration:executionGeneration
                                        outcome:@"failed"
                                         reason:@"write-failed"
                                        message:@"The image could not be saved."];
                return;
            }
            [strongSelf vj_completeRequest:request
                       executionGeneration:executionGeneration
                                    outcome:@"success"
                                     reason:@"saved-selected"
                                    message:[NSString stringWithFormat:@"Saved %@.", destination.lastPathComponent]];
        });
    });
}

- (NSString *)vj_operationForRequest:(NSString *)request
{
    NSString *operation = [[request componentsSeparatedByString:@":"] firstObject];
    return [operation isEqualToString:@"copy"] ||
           [operation isEqualToString:@"downloads"] ||
           [operation isEqualToString:@"save-as"]
        ? operation
        : nil;
}

- (NSString *)vj_extensionForData:(NSData *)data
{
    if (data.length >= 3) {
        const unsigned char *bytes = data.bytes;
        if (bytes[0] == 0xff && bytes[1] == 0xd8 && bytes[2] == 0xff) {
            return @"jpg";
        }
    }
    if (data.length >= 8) {
        const unsigned char *bytes = data.bytes;
        const unsigned char pngSignature[] = {0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
        if (memcmp(bytes, pngSignature, sizeof(pngSignature)) == 0) {
            return @"png";
        }
    }
    return nil;
}

- (BOOL)vj_hasSafePixelDimensions:(NSData *)data
{
    CGImageSourceRef imageSource = CGImageSourceCreateWithData((__bridge CFDataRef)data, NULL);
    if (!imageSource) {
        return NO;
    }
    CFStringRef imageType = CGImageSourceGetType(imageSource);
    BOOL supportedType = imageType &&
        (CFStringCompare(imageType, CFSTR("public.jpeg"), 0) == kCFCompareEqualTo ||
         CFStringCompare(imageType, CFSTR("public.png"), 0) == kCFCompareEqualTo);
    BOOL completeSingleImage = CGImageSourceGetCount(imageSource) == 1 &&
        CGImageSourceGetStatus(imageSource) == kCGImageStatusComplete &&
        CGImageSourceGetStatusAtIndex(imageSource, 0) == kCGImageStatusComplete;
    if (!supportedType || !completeSingleImage) {
        if (imageSource) {
            CFRelease(imageSource);
        }
        return NO;
    }
    CFDictionaryRef propertiesRef = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, NULL);
    NSDictionary *properties = CFBridgingRelease(propertiesRef);
    NSNumber *width = properties[(__bridge NSString *)kCGImagePropertyPixelWidth];
    NSNumber *height = properties[(__bridge NSString *)kCGImagePropertyPixelHeight];
    unsigned long long pixelWidth = width.unsignedLongLongValue;
    unsigned long long pixelHeight = height.unsignedLongLongValue;
    CFRelease(imageSource);
    return pixelWidth > 0 && pixelHeight > 0 &&
           pixelWidth <= VJComposeMaximumImagePixels / pixelHeight;
}

- (NSString *)vj_safeFileName:(NSString *)suggestedFileName extension:(NSString *)extension
{
    NSString *baseName = suggestedFileName.lastPathComponent.stringByDeletingPathExtension;
    if (baseName.length == 0) {
        baseName = @"image";
    }
    NSCharacterSet *allowed = [NSCharacterSet characterSetWithCharactersInString:
        @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."];
    NSMutableString *safe = [NSMutableString stringWithCapacity:baseName.length];
    for (NSUInteger index = 0; index < MIN(baseName.length, 120); index++) {
        unichar character = [baseName characterAtIndex:index];
        [safe appendString:[allowed characterIsMember:character]
            ? [NSString stringWithCharacters:&character length:1]
            : @"-"];
    }
    while ([safe containsString:@"--"]) {
        [safe replaceOccurrencesOfString:@"--" withString:@"-" options:0 range:NSMakeRange(0, safe.length)];
    }
    NSString *trimmed = [safe stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"-_."]];
    if (trimmed.length == 0) {
        trimmed = @"image";
    }
    return [trimmed stringByAppendingPathExtension:extension];
}

- (void)vj_completeRequest:(NSString *)request
       executionGeneration:(NSUInteger)executionGeneration
                    outcome:(NSString *)outcome
                     reason:(NSString *)reason
                    message:(NSString *)message
{
    if (![self vj_isCurrentRequest:request executionGeneration:executionGeneration] || !_onResult) {
        return;
    }
    SCValdiMacOSFunction *onResult = _onResult;
    _activeRequest = nil;
    _activeExecutionGeneration = 0;
    [onResult performWithParameters:@[
        request ?: @"",
        outcome ?: @"failed",
        reason ?: @"unknown",
        message ?: @"",
    ]];
}

@end

@implementation VJComposeImageExportSessionDelegate

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
didReceiveResponse:(NSURLResponse *)response
 completionHandler:(void (^)(NSURLSessionResponseDisposition disposition))completionHandler
{
    VJComposeImageExportBridge *owner = self.owner;
    if (!owner) {
        completionHandler(NSURLSessionResponseCancel);
        return;
    }
    [owner URLSession:session
             dataTask:dataTask
   didReceiveResponse:response
    completionHandler:completionHandler];
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data
{
    [self.owner URLSession:session dataTask:dataTask didReceiveData:data];
}

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didCompleteWithError:(NSError *)error
{
    [self.owner URLSession:session task:task didCompleteWithError:error];
}

@end
