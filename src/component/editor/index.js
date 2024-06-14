import React, { useState, useEffect } from "react";
import {
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import Editor from "draft-js-plugins-editor";
import "draft-js/dist/Draft.css";
import Title from "../title";
import Button from "../button";

const styleMap = {
  RED: {
    color: "red",
  },
  UNDERLINE: {
    textDecoration: "underline",
  },
};

const EditorComponent = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedData = localStorage.getItem("editorContent");
    return savedData
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedData)))
      : EditorState.createEmpty();
  });

  useEffect(() => {
    const saveContent = () => {
      const content = editorState.getCurrentContent();
      localStorage.setItem(
        "editorContent",
        JSON.stringify(convertToRaw(content))
      );
    };
    window.addEventListener("beforeunload", saveContent);
    return () => {
      window.removeEventListener("beforeunload", saveContent);
    };
  }, [editorState]);

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (chars) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const blockText = currentBlock.getText();
    const blockLength = blockText.length;

    if (chars === " " && selection.getStartOffset() === blockLength) {
      const matchSingleStar = blockText.match(/^\*(\s*)$/);
      const matchDoubleStar = blockText.match(/^\*\*(\s*)$/);
      const matchTripleStar = blockText.match(/^\*\*\*(\s*)$/);
      const matchBackticks = blockText.match(/^```\s*$/);

      let newContentState;
      let newState;

      if (blockText[0] === "#") {
        newContentState = Modifier.setBlockType(
          currentContent,
          selection,
          "header-one"
        );
        newContentState = Modifier.removeRange(
          newContentState,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 1,
          }),
          "backward"
        );
        newState = EditorState.push(
          editorState,
          newContentState,
          "change-block-type"
        );
        setEditorState(newState);
        return "handled";
      } else if (matchSingleStar) {
        newContentState = Modifier.removeRange(
          currentContent,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 1,
          }),
          "backward"
        );
        newState = RichUtils.toggleInlineStyle(
          EditorState.push(editorState, newContentState, "remove-range"),
          "BOLD"
        );
        setEditorState(newState);
        return "handled";
      } else if (matchDoubleStar) {
        newContentState = Modifier.removeRange(
          currentContent,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 2,
          }),
          "backward"
        );
        newState = RichUtils.toggleInlineStyle(
          EditorState.push(editorState, newContentState, "remove-range"),
          "RED"
        );
        setEditorState(newState);
        return "handled";
      } else if (matchTripleStar) {
        newContentState = Modifier.removeRange(
          currentContent,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 3,
          }),
          "backward"
        );
        newState = RichUtils.toggleInlineStyle(
          EditorState.push(editorState, newContentState, "remove-range"),
          "UNDERLINE"
        );
        setEditorState(newState);
        return "handled";
      } else if (matchBackticks) {
        newContentState = Modifier.setBlockType(
          currentContent,
          selection,
          "code-block"
        );
        newContentState = Modifier.removeRange(
          newContentState,
          selection.merge({
            anchorOffset: 0,
            focusOffset: 3,
          }),
          "backward"
        );
        newState = EditorState.push(
          editorState,
          newContentState,
          "change-block-type"
        );
        setEditorState(newState);
        return "handled";
      }
    }

    return "not-handled";
  };

  const onChange = (newState) => {
    setEditorState(newState);
  };

  const onSave = () => {
    const content = editorState.getCurrentContent();
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(content))
    );
    alert("Content saved!");
  };

  return (
    <div>
      <div className="container">
        <Title />
        <Button onSave={onSave} />
      </div>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          customStyleMap={styleMap}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default EditorComponent;
