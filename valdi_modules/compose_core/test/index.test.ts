import {
  Box,
  Card,
  Column,
  Image,
  LazyColumn,
  LazyRow,
  Row,
  Spacer,
  Text,
  remember,
  textLineHeightRatio,
} from "../src";

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

if (textLineHeightRatio(18, "system 12") !== 1.5) {
  throw new Error("Text did not convert an absolute line height to Valdi's multiplier");
}

if (textLineHeightRatio(15, "system-bold 10") !== 1.5) {
  throw new Error("Text did not read the font size from a bold system font");
}

if (textLineHeightRatio(18, "invalid") !== 1.5) {
  throw new Error("Text did not use the 12-point fallback for an invalid font string");
}

if (textLineHeightRatio() !== undefined) {
  throw new Error("Text changed an unspecified line height");
}
