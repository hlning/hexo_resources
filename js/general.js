window.onkeydown = window.onkeyup = window.onkeypress = function (event) {
    // 判断是否按下F12，F12键码为123
    if (event.keyCode === 123) {
        event.preventDefault(); // 阻止默认事件行为
        window.event.returnValue = false;
    }
}
document.oncontextmenu = function(){
    return false;
}

let full_page = document.getElementsByClassName("full_page");
if (full_page.length != 0) {
    full_page[0].style.background = "transparent";
}