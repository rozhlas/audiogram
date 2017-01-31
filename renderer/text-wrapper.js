var smartquotes = require("smartquotes").string;

module.exports = function(theme) {

  // Do some typechecking
  var left = ifNumeric(theme.captionLeft, 0),
      right = ifNumeric(theme.captionRight, theme.width),
      bottom = ifNumeric(theme.captionBottom, null),
      top = ifNumeric(theme.captionTop, null);

  if (bottom === null && top === null) {
    top = 0;
  }

  var captionWidth = right - left;

  return function(context, caption) {

    if (!caption) {
      return;
    }
    var totalHeight = 0;
    var captionParts = caption.split(/\s\s\s/);
    var lines = [];
    var hasHeading = captionParts.length > 1;
    context.textBaseline = "top";
    context.textAlign = theme.captionAlign || "center";
    captionParts.forEach(function(headingOrContent, captionPartIndex) {

      var words = smartquotes(headingOrContent + "").trim().replace(/\s\s+/g, " \n").split(/ /g);
      var isHeading = hasHeading && captionPartIndex === 0;
      var stylePrefix = hasHeading
        ? isHeading ? "captionHeading" : "captionUnderHeading"
        : "caption";
      var lineStyle = {
        font: theme[stylePrefix + "Font"],
        lineHeight: theme[stylePrefix + "LineHeight"],
        lineSpacing: theme[stylePrefix + "LineSpacing"]
      }
      var newLine = [];
      newLine.style = lineStyle;
      newLine.y = totalHeight;
      lines.push(newLine);

      context.font = lineStyle.font;

      // Check whether each word exceeds the width limit
      // Wrap onto next line as needed
      words.forEach(function(word,i){
        var width = context.measureText(lines[lines.length - 1].concat([word]).join(" ")).width;

        if (word[0] === "\n" || (lines[lines.length - 1].length && width > captionWidth)) {
          word = word.trim();
          totalHeight += lineStyle.lineHeight;
          lines.push([word]);
          lines[lines.length - 1].style = lineStyle;
          lines[lines.length - 1].y = totalHeight;
          width = context.measureText(word).width;
        } else {
          lines[lines.length - 1].push(word);
        }
      });

      totalHeight += lineStyle.lineHeight;
      if(isHeading) {
        totalHeight += theme.captionHeadingMarginBottom;
      }
    });

    // horizontal alignment
    var x = theme.captionAlign === "left" ? left : theme.captionAlign === "right" ? right : (left + right) / 2;

    // Vertical alignment
    var y;

    if (top !== null && bottom !== null) {
      // Vertical center
      y = (bottom + top - totalHeight) / 2;
    } else if (bottom !== null) {
      // Vertical align bottom
      y = bottom - totalHeight;
    } else {
      // Vertical align top
      y = top;
    }

    context.fillStyle = theme.captionColor;
    lines.forEach(function(line, i){
      context.font = line.style.font;
      context.fillText(line.join(" "), x, y + line.y);
    });

 };


}

function ifNumeric(val, alt) {
  return (typeof val === "number" && !isNaN(val)) ? val : alt;
}
