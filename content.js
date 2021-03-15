function swipeLeft() {
  console.log("swipe left");
  let bnt = document.querySelector("button[aria-label='Nope']");
  if (bnt) {
    bnt.click();
  }
}

function swipeRight(profileImageURL, why) {
  console.log("LIKE", profileImageURL, why);
  let bnt = document.querySelector("button[aria-label='Like']");
  if (bnt) {
    bnt.click();
  }
}

function processImage(apiKey, profileImageURL) {
  console.log("Processing image");
  let data = {
    requests: [
      {
        image: {
          source: {
            imageUri: profileImageURL,
          },
        },
        features: [
          {
            type: "LABEL_DETECTION",
          },
        ],
      },
    ],
  };
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    console.log( 'event listener' )
    if (this.readyState === 4 && this.status === 200) {
      let res = JSON.parse(this.responseText);
      let labels = res["responses"][0]["labelAnnotations"];
      if (labels === undefined) {
        swipeLeft();
        return;
      }
      let labelMap = {};
      for (let i = 0; i < labels.length; i++) {
        labelMap[labels[i]["description"]] = labels[i]["score"];
      }
      console.log(labelMap);
      if ("girl" in labelMap && labelMap["girl"] >= 0.6) {
        if ("gravure idol" in labelMap || "japanese idol" in labelMap) {
          // I don't like it.
          swipeLeft();
        } else if ("selfie" in labelMap) {
          // I don't like it.
          swipeLeft();
        } else if (
          "brassiere" in labelMap ||
          "lingerie" in labelMap ||
          "undergarment" in labelMap
        ) {
          // I don't like it.
          swipeLeft();
        } else if ("beauty" in labelMap && labelMap["beauty"] >= 0.9) {
          // Definitely swipe right. Never miss this.
          swipeRight(profileImageURL, "beauty");
        } else if (
          "beauty" in labelMap &&
          labelMap["beauty"] >= 0.8 &&
          "smile" in labelMap &&
          labelMap["smile"] >= 0.8
        ) {
          // smile!
          swipeRight(profileImageURL, "smile");
        } else if (
          "beauty" in labelMap &&
          labelMap["beauty"] >= 0.8 &&
          "hairstyle" in labelMap &&
          labelMap["hairstyle"] >= 0.8
        ) {
          // hairstyle!
          swipeRight(profileImageURL, "hairstyle");
        } else if ("lady" in labelMap && labelMap["lady"] >= 0.8) {
          // lady!
          swipeRight(profileImageURL, "lady");
        } else {
          if (Math.random() * 100 <= Math.PI) {
            swipeRight(profileImageURL, "lucky");
          } else {
            swipeLeft();
          }
        }
      } else {
        swipeLeft();
      }
    } else if (this.readyState === 4 && this.status !== 200) {
      console.log(this.status);
      console.log(this.responseText);
      swipeLeft();
    }
  });

  xhr.open(
    "POST",
    "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey
  );
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("cache-control", "no-cache");
  // new
  xhr.setRequestHeader("Access-Control-Allow-Credentials", "true");
  xhr.setRequestHeader("Access-Control-Allow-Origin", "http://localhost");

  xhr.send(JSON.stringify(data));
}

chrome.storage.sync.get(null, function (items) {
  if (items.apiKey) {
    function mainLoop() {
      setTimeout(function () {
        // Right copy JS path
        let imageNode = document.querySelector(
          "#t-429325247 > div > div.App__body.H\\(100\\%\\).Pos\\(r\\).Z\\(0\\) > div > main > div.H\\(100\\%\\) > div > div > div.recsCardboard.W\\(100\\%\\).Mt\\(a\\).H\\(100\\%\\)--s.Px\\(4px\\)--s.Pos\\(r\\) > div > div.recsCardboard__cards.Expand.Animdur\\(\\$fast\\).Animtf\\(eio\\).Pos\\(r\\).CenterAlign > div.Toa\\(n\\).Wc\\(\\$transform\\).Prs\\(1000px\\).Bfv\\(h\\).Ov\\(h\\).W\\(100\\%\\).StretchedBox.Bgc\\(\\$c-placeholder\\).Bdrs\\(8px\\) > div.Expand.D\\(f\\).Pos\\(r\\).tappable-view.Cur\\(p\\) > div.Expand.Pos\\(a\\).D\\(f\\).Ov\\(h\\).Us\\(n\\).keen-slider > span:nth-child(1) > div"
        );
        if (imageNode) {
          let imgUrl = imageNode.style.backgroundImage;
          imgUrl = imgUrl.substring(
            imgUrl.indexOf('"') + 1,
            imgUrl.lastIndexOf('"')
          );
          console.log(imgUrl);
          processImage(items.apiKey, imgUrl);
        } else {
          console.log("Not found profile image, please refresh the page.");
        }
        mainLoop();
      }, 3800);
    }

    mainLoop();
  } else {
    alert(
      "Please add Google Vision API key from extension options. Now using demo mode!!"
    );

    function demoLoop() {
      setTimeout(function () {
        if (Math.random() <= 0.88) {
          swipeRight("N/A", "demo");
        } else {
          swipeLeft();
        }
        demoLoop();
      }, 2000);
    }

    demoLoop();
  }
});
