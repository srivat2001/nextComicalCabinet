export default function validateInputs(title, para, section) {
  const validationProblems = [];
  if (title.length < 20 || title.length > 180) {
    validationProblems.push("Title should be between 20 and 180 characters.");
  }

  // if (!/^https?:\/\/.*\.(jpe?g|png)(\?.*)?$/i.test(imglink)) {
  //   validationProblems.push("Image link is not valid.");
  // }

  const wordsCount = para.trim().split(/\s+/).length;

  if (wordsCount < 20 || wordsCount > 80000) {
    validationProblems.push("Paragraph should be between 20 and 80000 words.");
  }
  if (!section) {
    validationProblems.push("Select Section");
  }

  return validationProblems;
}
