const R = require('ramda');

/* ********************************************************************************************** */
/* ****************************          Predicate  Methods           *************************** */
/* ********************************************************************************************** */
// Check if value of x is 0. Return true if x is 0, false otherwise.
const isZero = x => x === 0;

// Check if value of the input is Alphanumeric. Return true if it is, false otherwise.
const isAlphaNumeric = R.compose(isZero, R.length(), R.match(/[^a-zA-Z0-9]/g));

// Compare to string (Commonly used for sorting strings). Return true string a is less than string
// b, false otherwise.
const compareStrings = R.comparator((a, b) => a < b);

// Takes a property (prop) of an object and converts it to a JS date object. Useful for the
// 'date_taken' property of Flickr data. Use: lensPropToJSDate('date_taken') => Date Object. Returns
// Date object
const lensPropToJSDate = prop => R.over(R.lensProp(prop))(item => new Date(item));

/* ********************************************************************************************** */
/* ****************************            Helper Methods             *************************** */
/* ********************************************************************************************** */
// Takes input of 1 or more string object separated by spaces (like the tags of the flickr data) in
// arrays, and turns them into an array of single word string objects.
const combineStringArray = R.compose(
  R.split(' '),
  R.join(' '),
);

/* ********************************************************************************************** */
/* **************************** Filtering Properties From Flickr JSON *************************** */
/* ********************************************************************************************** */
// Returns the array of objects in the item property
const flickrImageData = R.compose(
  R.prop('items'),
);

// Returns an array of combined tags of all images in the items property
const flickrTags = R.compose(
  combineStringArray,
  R.map(R.prop('tags')),
  flickrImageData,
);

// Returns an array titles for the images in the items property
const flickrTitles = R.compose(
  R.map(R.prop('title')),
  flickrImageData,
);

/* ********************************************************************************************** */
/* ****************************         OTHER Helper Methods          *************************** */
/* ********************************************************************************************** */
const filterAlphaNumeric = R.compose(
  R.filter(item => isAlphaNumeric(item)),
  combineStringArray,
);

const filterNotAlphaNumeric = R.compose(
  R.filter(item => !isAlphaNumeric(item)),
  combineStringArray,
);

const lowerCaseUniq = R.compose(
  R.uniq(),
  R.map(item => R.toLower(item)),
);

/* ********************************************************************************************** */
/* ****************************   Functions Required For Assignment   *************************** */
/* ********************************************************************************************** */








//------------------------------------------------------------------------------------------------------------------>

/***************************************************************************
 *                                                                         * 
 *  Project 6: This program uses Ramda and Javascript to manipulate JSON   *
 *             objects provided to us on a file. The functions will not    *
 *             alter the state of the program as they have a functional    * 
 *             nature. I used a combination of pipe/compose to implament   *
 *             the functions in the program                                *
 *                                                                         *
 *  Author: Bryan Lopez                                                    *      
 *  Class: COP 4530 | Dr. William Oropallo                                 *
 *                                                                         *
 * *************************************************************************/


 
/* 1. This function will return the number of images contained in the JSON objects in 
the file provided by the project. The imageCount will hold the total amount of items
in the file.*/
const imageCount = (Data) => 
{
  return R.compose( R.length(), flickrImageData ) (Data);
}; 

/* 2. This function will return an array of the flickrTags that are unic and alphanumeric. The function will 
pipe the Tags output to a map to accomodate white spaces, check with 'filterAlphaNumeric' for characters 
that are not alphanumeric and filter them out, then the 'lowerCaseUniq' will make the elements all lower
case and finally sort them by comparing their string values where A < B,C,D... */
const alphaNumericTagsUniq = (Data) => 
{
  return R.pipe( flickrTags, R.map(R.split(' ')),
    filterAlphaNumeric,
    lowerCaseUniq,
    R.sort(compareStrings)
  )(Data);
};

/* 3. This function will return any other values that are not alphaNumeric in the JSON objects
 retrieved from the file. This method does not have any other steps besides providing with the
 non alphanumeric data. */
const nonAlphaNumericTags = (Data) => 
{
    return R.pipe( flickrTags, filterNotAlphaNumeric ) (Data);
};

/* 4. This function will return the value of the average title length of the JSON objects including
characters and whitespace. The pipe passes the flickrTitles to a map where the length of each element
is determined and then based on that number, the mean or average is calculated */
const avgTitleLength = (Data) => 
{
  return R.pipe( flickrTitles, R.map(R.length()), R.mean() ) (Data);
};

/* 5. This function checks for the most frequencly occuring tag in the JSON data. The way it does this is by classifying the rank
Like explained in the instructions : "Calling this functions with an n of 0 returns the most common tag, 
and calling it with an n of 2 returns the 3rd most common tag."  */
const commonTagByRank = rank => (Data) => 
{
  return R.compose( R.prop('key'), R.nth(rank),
                    R.reverse(), R.sortBy(x=>x.freq),
                    R.map(x=> { return {key: x[0], freq: R.length(x[1])}}),
                    R.toPairs(), R.groupBy(x=>x),
                    R.map(R.split(' ')),
                    flickrTags ) (Data);
};

/* 6. This function will return the title of the oldest photo taken for all of the images contained in the JSON objects 
It will use the 'date_taken' property to be able to determine which one is the oldest */
const oldestPhotoTitle = (Data) => 
{
    return R.compose( R.head(), R.map(R.prop('title')),
      R.sortBy(R.prop('date_taken')),
      flickrImageData ) (Data);
}

//------------------------------------------------------------------------------------------------------------------>











/* ********************************************************************************************** */
/* ********************************************************************************************** */
/* ****************************          All JSON Test Code           *************************** */
/* ****************************             DO NOT ALTER              *************************** */
/* ********************************************************************************************** */
/* ********************************************************************************************** */
const fs = require('fs');
const {
  makePromiseTest, runAllPromiseTest, alphaNumericTagsUniqTest1, alphaNumericTagsUniqTest2,
} = require('./testsetup');

const flickrDataDog = JSON.parse(fs.readFileSync('dogs.json', 'utf8'));
const flickrDataLandscapes = JSON.parse(fs.readFileSync('landscapes.json', 'utf8'));

runAllPromiseTest([
  makePromiseTest('Is flickrDataDog an object?', typeof flickrDataDog, 'object'),
  makePromiseTest('Images count should be 20', imageCount(flickrDataDog), 20),
  makePromiseTest(
    'Should get an array of all the unique alphanumeric tags after transforming to lower case, '
    + 'sorted lexicographically',
    alphaNumericTagsUniq(flickrDataDog), R.sort(compareStrings)(alphaNumericTagsUniqTest1),
  ),
  makePromiseTest(
    'Should Only Be 1 non alphanumeric tag as "świnoujście"',
    R.compose(R.head, nonAlphaNumericTags)(flickrDataDog), 'świnoujście',
  ),
  makePromiseTest(
    'Average Title Length Should be 26 (Rounded)',
    R.compose(Math.round, avgTitleLength)(flickrDataDog), 26,
  ),
  makePromiseTest(
    'Third most common tag should be "puppy" (0 index, where 0 is most common)',
    commonTagByRank(2)(flickrDataDog), 'puppy',
  ),
  makePromiseTest(
    'Oldest Photo Taken Title Should Be "20160626_P1060675"',
    oldestPhotoTitle(flickrDataDog), '20160626_P1060675',
  ),
]);

runAllPromiseTest([
  makePromiseTest('Is flickrDataLandscapes an object?', typeof flickrDataLandscapes, 'object'),
  makePromiseTest('Images count should be 20', imageCount(flickrDataLandscapes), 20),
  makePromiseTest(
    'Should get an array of all the unique alphanumeric tags after transforming to lower case, '
    + 'sorted lexicographically',
    alphaNumericTagsUniq(flickrDataLandscapes), R.sort(compareStrings)(alphaNumericTagsUniqTest2),
  ),
  makePromiseTest(
    'Should not be any non-alphanumeric tags (resulting in an [])',
    R.compose(nonAlphaNumericTags)(flickrDataLandscapes), [],
  ),
  makePromiseTest(
    'Average Title Length Should be 16 (Rounded)',
    R.compose(Math.round, avgTitleLength)(flickrDataLandscapes), 16,
  ),
  makePromiseTest(
    'Third most common tag should be "landscaping" (0 index, where 0 is most common)',
    commonTagByRank(2)(flickrDataLandscapes), 'landscaping',
  ),
  makePromiseTest(
    'Oldest Photo Taken Title Should Be "Boats of Golyazi"',
    oldestPhotoTitle(flickrDataLandscapes), 'Boats of Golyazi',
  ),
]);
