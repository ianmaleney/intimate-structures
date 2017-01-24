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
var vw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

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

  if (vw > 900) {
    if (chapterMenuPos() < (vh/20)) {
      chapterMenu.classList.add("sticky");
    } else {
      chapterMenu.classList.remove("sticky");
    }
  } else {
    chapterMenu.classList.add("sticky");
  }
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

    var next = num + 1;

    // Home Clearing for First Chapter
    if(response.chapters[num].number > "0"){
      home.style.display = "none";
    }

    // Standard Chapter Clearing + Window Reset
    chapter.style.display = "none";
    chapterMenu.classList.remove("sticky");
    window.scrollTo(0,0);

    // Video Reload
    v.src = response.chapters[num].video_path;
    if (vw > 600) {
      v.playbackRate = 0.2;
    } else {
      v.pause();
    }


    // Inject Text of Next Chapter
    var url = response.chapters[num].path;

    function inject(){
      get(url).then(function(chapterText){
        chapterContainer.innerHTML = chapterText;
      });
    }
    if (num > 0){
      inject();
    }

    // Update Floating Navigation
    for (var i = 0; i < chapterButton.length; i++){
      chapterButton[i].classList.remove("active");
    }
    chapterButton[num].classList.add("active");


    // Update End-of-Chapter Navigation
    if(num < 4) {
      nextButton.innerHTML = "Next: Chapter " + response.chapters[next].number + " - " + response.chapters[next].title;
      nextButton.addEventListener("click", function(){
        getChapter(next);
      }, false);
    }

    if (num === 4){
      nextButton.innerHTML = "Please consider supporting Fallow Media and helping us to continue our work.";
      nextButton.href = 'https://www.patreon.com/fallowmedia';
      nextButton.target = '_blank';
      nextButton.rel = 'noopener';
      nextButton.addEventListener("click", function(){
        getChapter(4);
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
      var j = index + 1;
      getChapter(j);
    });
  });
}

// Expand Floating Navigation
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

    if (vw > 600) {
      v.playbackRate = 0.2;
    } else {
      v.pause();
    }

    v.addEventListener('play', function(){
        draw(this,context,cw,ch);
    },false);

    nextButton.addEventListener("click", function(){
      getChapter(1);
    }, false);

    floatingNav();

},false);
