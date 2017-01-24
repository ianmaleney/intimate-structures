var titleSVG = document.querySelector(".c-home__title--background");
var chapterSlideGrid = document.querySelector(".c-chapter-slide");
var chapterMenu = document.querySelector(".c-chapter-menu");
var vh = window.innerHeight;
var home = document.querySelector(".c-home");
var chapter = document.querySelector(".c-chapter");
var nextButton = document.querySelector(".c-next__button");
var chapterContainer = document.querySelector(".c-chapter-container");
var v = document.getElementById('v');
var chapterButton = document.querySelectorAll(".c-chapter__button");
var floatingNavToggle = document.querySelector(".c-chapter-menu__toggle");
var floatingNavLink = document.querySelectorAll(".c-chapter__link");

// Helper Functions for Positioning
function csgPos() { return chapterSlideGrid.getBoundingClientRect().top; }

function chapterMenuPos() { return chapterMenu.getBoundingClientRect().top; }

function titleSVGPos() { return titleSVG.getBoundingClientRect().top; }

// Draw Function for Canvas & Video
function draw(v,c,w,h) {
  if(v.paused || v.ended) {
    return false;
  } else {
    c.drawImage(v,0,0,w,h);
    window.requestAnimationFrame(function() {
      draw(v,c,w,h);
    });
  }
}

// Scroll Events
document.addEventListener("scroll", function(){

  if (titleSVGPos() < (-vh/2)) {
    titleSVG.classList.remove("visible");
  } else {
    titleSVG.classList.add("visible");
  }

  if (csgPos() < (vh - 150) && csgPos() > (150 - vh)){
    chapterSlideGrid.classList.add("visible");
  } else {
    chapterSlideGrid.classList.remove("visible");
  }

  /*if (chapterMenuPos() < (vh/20) && csgPos() < (0 - vh/18)) {
    chapterMenu.classList.add("sticky");
  } else {
    chapterMenu.classList.remove("sticky");
  }*/
});

// Promise Function
function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status === 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

// Use Promise Function to Get Chapters & Update Links
function getChapter(num){
  get('assets/js/chapters.json').then(JSON.parse).then(function(response) {

    // Home Clearing for First Chapter
    if(response.chapters[num].number > "0"){
      home.style.display = "none";
    }

    // Standard Chapter Clearing + Window Reset
    chapter.style.display = "none";
    window.scrollTo(0,0);

    // Video Reload
    v.src = response.chapters[num].video_path;
    v.playbackRate = 0.2;

    // Inject Text of Next Chapter
    var data = floatingNavLink[num].getAttribute('data-name');
    var url = data + ".html";

    function inject(){
      get(url).then(function(chapterText){
        chapterContainer.innerHTML = chapterText;
      });
    }
    inject();

    // Update Floating Navigation
    for (var i = 0; i < chapterButton.length; i++){
      chapterButton[i].classList.remove("active");
    }
    chapterButton[num].classList.add("active");


    // Update End-of-Chapter Navigation
    if (response.chapters[num].number === "4") {
      nextButton.innerHTML = "Return to the Beginning";
      nextButton.addEventListener("click", function(){
      getChapter(0);
    }, false);
      } else {
        nextButton.innerHTML = "Next: Chapter " + response.chapters[num + 1].number + " - " + response.chapters[num + 1].title;
        nextButton.addEventListener("click", function(){
          getChapter(num + 1);
        }, false);
      }

  }, function(error) {
    // Error Log
    console.error("Failed!", error);
  });
}

function floatingNav(){
  floatingNavLink.forEach(function(arr, index){
    floatingNavLink[index].addEventListener("click", function(){
      var j = index;
      getChapter(j);
      var data = floatingNavLink[index].getAttribute('data-name'),
      url = data + ".html";
      history.pushState(data, null, url);
    });
  });
}

floatingNavToggle.addEventListener('click', function(){
  this.classList.toggle('js-revealed');
});

// DOM Loaded Events - Video/Canvas Animation
document.addEventListener('DOMContentLoaded', function(){
    var v = document.getElementById('v');
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');

    var cw = Math.floor(canvas.clientWidth / 100);
    var ch = Math.floor(canvas.clientHeight / 100);
    canvas.width = cw;
    canvas.height = ch;

    v.playbackRate = 0.2;

    v.addEventListener('play', function(){
        draw(this,context,cw,ch);
    },false);

    nextButton.innerHTML = "Next: Chapter 1 - The Convent of Sainte-Marie de la Tourette";
    nextButton.addEventListener("click", function(){
      getChapter(1);
    }, false);

    floatingNav();

},false);

window.addEventListener('popstate', function(e) {
  var chapter = e.state;
});
