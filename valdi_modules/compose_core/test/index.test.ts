import { Box, Card, Column, Image, LazyColumn, LazyRow, Row, Spacer, Text, remember } from "../src";

[Row, Column, Box, Spacer, LazyRow, LazyColumn, Text, Image, Card].forEach(component => {
  if (typeof component !== "function") {
    throw new Error(`Expected component export to be a class/function, got ${typeof component}`);
  }
  if (!component.prototype?.onRender) {
    throw new Error(`Expected ${component.name} to expose onRender`);
  }
});

const value = remember(() => 42);
if (value !== 42) {
  throw new Error("remember() did not invoke factory");
}
