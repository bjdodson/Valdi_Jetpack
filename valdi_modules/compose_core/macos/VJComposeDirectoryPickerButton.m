#import <AppKit/AppKit.h>

#import "valdi/macos/SCValdiMacOSAttributesBinder.h"
#import "valdi/macos/SCValdiMacOSFunction.h"

@interface VJComposeDirectoryPickerButton : NSButton
@end

@implementation VJComposeDirectoryPickerButton {
    NSString *_panelTitle;
    NSString *_panelPrompt;
    NSString *_panelMessage;
    BOOL _canCreateDirectories;
    NSUInteger _invocationSequence;
    NSOpenPanel *_panel;
    SCValdiMacOSFunction *_onPathSelected;
}

- (void)dealloc
{
    [_panel cancel:nil];
}

- (instancetype)initWithFrame:(NSRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        self.title = @"Choose folder…";
        self.bezelStyle = NSBezelStyleRounded;
        self.target = self;
        self.action = @selector(vj_chooseDirectory:);
        self.accessibilityLabel = @"Choose folder";
        _panelTitle = @"Choose a folder";
        _panelPrompt = @"Choose";
        _panelMessage = @"";
    }
    return self;
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder
{
    [attributesBinder bindUntypedAttribute:@"label"
                  invalidateLayoutOnChange:YES
                                  selector:@selector(vj_setLabel:)];
    [attributesBinder bindUntypedAttribute:@"panelTitle"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setPanelTitle:)];
    [attributesBinder bindUntypedAttribute:@"panelPrompt"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setPanelPrompt:)];
    [attributesBinder bindUntypedAttribute:@"panelMessage"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setPanelMessage:)];
    [attributesBinder bindUntypedAttribute:@"canCreateDirectories"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setCanCreateDirectories:)];
    [attributesBinder bindUntypedAttribute:@"disabled"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setDisabled:)];
    [attributesBinder bindUntypedAttribute:@"onPathSelected"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(vj_setOnPathSelected:)];
}

- (void)vj_setLabel:(id)value
{
    self.title = [value isKindOfClass:[NSString class]] && [value length] > 0 ? value : @"Choose folder…";
}

- (void)vj_setPanelTitle:(id)value
{
    _panelTitle = [value isKindOfClass:[NSString class]] && [value length] > 0
        ? [value copy]
        : @"Choose a folder";
}

- (void)vj_setPanelPrompt:(id)value
{
    _panelPrompt = [value isKindOfClass:[NSString class]] && [value length] > 0
        ? [value copy]
        : @"Choose";
}

- (void)vj_setPanelMessage:(id)value
{
    _panelMessage = [value isKindOfClass:[NSString class]] ? [value copy] : @"";
}

- (void)vj_setCanCreateDirectories:(id)value
{
    _canCreateDirectories = [value respondsToSelector:@selector(boolValue)] && [value boolValue];
}

- (void)vj_setDisabled:(id)value
{
    self.enabled = ![value respondsToSelector:@selector(boolValue)] || ![value boolValue];
    if (!self.enabled) {
        _invocationSequence += 1;
        NSOpenPanel *panel = _panel;
        _panel = nil;
        [panel cancel:nil];
    }
}

- (void)vj_setOnPathSelected:(id)value
{
    _onPathSelected = [value isKindOfClass:[SCValdiMacOSFunction class]] ? value : nil;
}

- (void)vj_chooseDirectory:(id)sender
{
    if (!self.enabled) {
        return;
    }

    _invocationSequence += 1;
    NSUInteger invocation = _invocationSequence;
    [_panel cancel:nil];
    NSOpenPanel *panel = [NSOpenPanel openPanel];
    _panel = panel;
    panel.title = _panelTitle;
    panel.prompt = _panelPrompt;
    panel.message = _panelMessage.length > 0 ? _panelMessage : nil;
    panel.canChooseDirectories = YES;
    panel.canChooseFiles = NO;
    panel.allowsMultipleSelection = NO;
    panel.canCreateDirectories = _canCreateDirectories;

    __weak VJComposeDirectoryPickerButton *weakSelf = self;
    [panel beginWithCompletionHandler:^(NSModalResponse result) {
        VJComposeDirectoryPickerButton *strongSelf = weakSelf;
        NSURL *selectedURL = panel.URL;
        if (result == NSModalResponseOK &&
            strongSelf &&
            strongSelf.enabled &&
            strongSelf->_invocationSequence == invocation &&
            strongSelf->_panel == panel &&
            strongSelf->_onPathSelected &&
            selectedURL.isFileURL &&
            selectedURL.path.length > 0) {
            [strongSelf->_onPathSelected performWithParameters:@[selectedURL.path]];
        }
        if (strongSelf && strongSelf->_panel == panel) {
            strongSelf->_panel = nil;
        }
    }];
}

@end
