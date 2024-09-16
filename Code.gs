const BEARER_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAAMqRvwEAAAAAmuaXYFEvnm2hxtpydl%2BcCEtOWwM%3DcFIYUhGAlGDF4DHcdAVAh0mgaEGrXX7Uagp3WKajE4CqSW0boQ"; // Add your Twitter Bearer Token here

// This function will run every time you edit the sheet (i.e., when you paste a link in column A)
function onEdit(e) {
  const range = e.range; // The range that was edited
  const editedColumn = range.getColumn(); // Get the column number of the edited cell
  const editedRow = range.getRow(); // Get the row number of the edited cell

  // Check if the edit was made in column A
  if (editedColumn === 1) {
    const tweetUrl = range.getValue(); // Get the pasted value in the cell

    // Log the pasted URL to check if it's being captured
    Logger.log("Edited Row: " + editedRow + ", Column: " + editedColumn);
    Logger.log("Pasted content (tweet URL): " + tweetUrl);

    // Ensure the URL is valid and not empty
    if (tweetUrl && tweetUrl.trim() !== "") {
      const tweetData = getTweetData(tweetUrl); // Fetch tweet data

      if (tweetData && tweetData.data && tweetData.data.public_metrics) {
        const metrics = tweetData.data.public_metrics;

        // Log the results into columns B, C, and D next to the pasted link
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        sheet
          .getRange(editedRow, 2)
          .setValue(metrics.impression_count || "N/A"); // Impressions in column B
        sheet.getRange(editedRow, 3).setValue(metrics.like_count || "N/A"); // Likes in column C
        sheet.getRange(editedRow, 4).setValue(metrics.retweet_count || "N/A"); // Reposts in column D
      } else {
        Logger.log("No data returned for tweet: " + tweetUrl);
      }
    } else {
      Logger.log("Invalid or empty tweet URL pasted.");
    }
  }
}

// Helper function to fetch tweet data from Twitter API
function getTweetData(tweetUrl) {
  const tweetId = extractTweetId(tweetUrl); // Extract the Tweet ID

  if (!tweetId) {
    Logger.log("Failed to extract tweet ID from URL: " + tweetUrl);
    return null; // Exit if tweet ID extraction fails
  }

  const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`;

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
  };

  try {
    // Fetch the tweet data from Twitter API
    const response = UrlFetchApp.fetch(url, options);
    const tweetData = JSON.parse(response.getContentText());
    return tweetData;
  } catch (error) {
    Logger.log("Error fetching tweet data: " + error);
    return null;
  }
}

// Helper function to extract the Tweet ID from a Tweet URL
function extractTweetId(tweetUrl) {
  if (!tweetUrl || tweetUrl.trim() === "") {
    Logger.log("Tweet URL is empty or invalid.");
    return null; // Return null if the tweet URL is empty
  }

  try {
    const urlPattern = /\/status\/(\d+)/; // Regex to match the Tweet ID in the URL
    const match = tweetUrl.match(urlPattern);

    if (match && match[1]) {
      return match[1]; // Return the Tweet ID if found
    } else {
      Logger.log("Could not extract tweet ID from: " + tweetUrl);
      return null;
    }
  } catch (error) {
    Logger.log("Error extracting tweet ID: " + error);
    return null;
  }
}
