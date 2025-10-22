// Family photo data for the museum slideshow
// Update the BASE_URL to match your Cloudflare R2 bucket URL
const CLOUDFLARE_BASE_URL = 'https://pub-b1b1a0b8a789411aa54abb9c340ba12e.r2.dev';

export const familyPhotos = [
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_41.JPG`,
    caption: '(L-R) Eugene Wyman, Roz Wyman, Oliver Wyman, Samantha Wyman, 2011'
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_1.jpg`, 
    caption: 'B&W, Oscar Wiener (L) Sarah Wiener (R) in their pharmacy, 1950s'
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_2.jpg`, 
    caption: 'B&W, Oscar Wiener (L) Sarah Wiener (R) in their pharmacy, 1931'
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_3.jpg`, 
    caption: 'B&W, Roz Wiener in front of her mother.s Franklin D. Roosevelt poster that was hung up at the pharmacy, 1932'
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_20.jpg`, 
    caption: "B&W, vintage print, Betty Wyman (L) Bob Wyman (center L), Roz Wyman (center R), Brad Wyman (R) visiting City Hall to support their mother's reelection, 1966"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_42.JPG`, 
    caption: 'Roz Wyman (L), Oliver Wyman (center), Eugene Wyman (R), 2012'
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_66.jpg`, 
    caption: 'B&W, vintage print, (L-R) Betty Wyman, Roz wyman, Bob Wyman, Gene Wyman, 1962'
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_83.jpg`, 
    caption: "(L-R) Brad Wyman, Eugene Wyman, Samantha Wyman, Roz Wyman, Oliver Wyman, Peggy Wyman, Bob Wyman, Samantha's boyfriend, holiday celebration, 2014"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_84.jpg`, 
    caption: "(L-R) Bob Wyman, Peggy Wyman, John  Deeb, Betty Wyman, Jean Firstenberg, Roz Wyman, Oliver Wyman, Eugene Wyman, Brad Wyman, 2015"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_85.jpg`, 
    caption: "(L-R) Oliver Wyman, Brad Wyman, Roz Wyman, Eugene Wyman, lunch celebrating the grandkids birthday, 2016"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_88.jpg`, 
    caption: "B&W, vintage print, (L-R), Betty Wyman, Gene Wyman, Roz Wyman, Brad Wyman, Bob Wyman, their dog Bingo, 1965"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_99.jpg`, 
    caption: "B&W, vintage print, (L-R) Oscar Wiener, Roz Wiener, Sarah Wiener, Brother George, celebrating the win of the 1953 election of Roz, 1953"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_100.jpg`, 
    caption: "Color, vintage print, (L-R) Bob Wyman, Brad Wyman, Roz Wyman, Edward Kennedy, Betty Wyman, having Edward over their home preparing Roz for her second run at office, 1970s"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_97.jpg`, 
    caption: "Color, vintage print, (L-R) Betty Wyman, Gene Wyman, Bob Wyman, Abba Eban, Roz Wyman, Brad Wyman, having Abba Eban over the home, 1970s"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_131.jpg`, 
    caption: "B&W, 8x10 inch, vintage print, (L-R) Gene Wyman, Roz Wyman, Betty Wyman, 1958"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_149.jpg`, 
    caption: "B&W, 8x10 inch, vintage print, (L-R) Robert Kennedy, Gene Wyman, Betty Wyman, Bob Wyman, Brad Wyman, 1965"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_154.jpg`, 
    caption: "B&W, 10x8inch, framed, vintage print, Gene Wyman (L), RRoz Wyman (R), at a convention, 1963"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_159.jpg`, 
    caption: "Color,  framed, vintage print, 8x10 inch, (L-R) Gene Wyman, J. Edgar Hoover, Roz Wyman,  Betty Wyman, Bob Wyman, Brad Wyman, June 10th, 1967"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_183.jpg`, 
    caption: 'scrapbook page, B&W, vintage print, "Roz with mom and dad" Top: 1953 Bottom: 1965'
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_185.jpg`, 
    caption: "scrapbook page, B&W, vintage prints, Roz and Gene Wyman with Betty Wyman, Bob Wyman, Brad Wyman, 1965"
  },
  {
    src: `${CLOUDFLARE_BASE_URL}/images/family/roz_186.jpg`, 
    caption: 'scrapbook page, Sepia, B&W, Top: "Bobby 1960"  featuring Betty Wyman Bottom: "Brad 1963"'
  }
];

// Video URL - also hosted on Cloudflare
export const documentaryVideo = {
  mp4: `${CLOUDFLARE_BASE_URL}/videos/ROZ_DOC.mp4`,
  webm: `${CLOUDFLARE_BASE_URL}/videos/ROZ_DOC.webm`
};
