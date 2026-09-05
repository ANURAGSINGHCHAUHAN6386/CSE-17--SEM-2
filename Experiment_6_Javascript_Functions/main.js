let heading = document.getElementById("mainHeading");
let paragraph = document.getElementById("paragraph");
let input = document.getElementById("userInput");

let fontSize = 16;
let isHidden = false;

// 1. Change Heading Text
document.getElementById("changeHeading-btn").addEventListener("click", function () {
    if (input.value.trim() !== "") {
        heading.innerText = input.value;
    }
});

// 2. Change Background Color
document.getElementById("changebg-btn").addEventListener("click", function () {
    document.body.style.backgroundColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);
});

// 3. Increase Font Size
document.getElementById("increaseFont-btn").addEventListener("click", function () {
    fontSize += 2;
    paragraph.style.fontSize = fontSize + "px";
});

// 4. Hide / Show Paragraph
document.getElementById("hideParagraph-btn").addEventListener("click", function () {
    if (isHidden) {
        paragraph.style.display = "block";
        isHidden = false;
    } else {
        paragraph.style.display = "none";
        isHidden = true;
    }
});

// 5. Reset Everything
document.getElementById("Reset-btn").addEventListener("click", function () {
    heading.innerText = "Welcome to Javascript Lab";
    paragraph.style.fontSize = "16px";
    paragraph.style.display = "block";
    document.body.style.backgroundColor = "white";
    input.value = "";
    fontSize = 16;
    isHidden = false;
});