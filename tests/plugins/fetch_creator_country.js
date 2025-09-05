// name: fetch_instagram_creator_country
// description: Fetches creator account ID and country code for Instagram creators.
// type: engine_plugin

/**
 * Fetch Instagram Creator Account Data and merge with SourceJSON
 * @param {Object} input - Input object containing `sourceJSON`, `accessToken`, and `userIdOrName`.
 * @returns {Object} - Updated JSON object containing the original SourceJSON and API response under "creator_details".
 */
function fetch_instagram_creator_country(input) {
    var debugLevel=getDebugLevel();
    if (debugLevel > 0) {
        console.log("[DEBUG-fetch_instagram_creator_country] Executing plugin: fetch_instagram_creator_country");
        console.log("[DEBUG-fetch_instagram_creator_country] Input data:", input);
    }

    // Validate input
    if (!input) {
        console.error("Missing input");
        return input.sourceJSON;
    }
    if (!input.sourceJSON) {
        console.error("SourceJSON");
        return input.sourceJSON;
    }
    if (!input.accessToken) {
        console.error("Missing 'accessToken'.");
        input.sourceJSON = input.sourceJSON || {};
        input.sourceJSON.insta_creator_api_details.creatorId = {};
        input.sourceJSON.insta_creator_api_details.country = "";
        input.sourceJSON.insta_creator_api_status = "error";
        input.sourceJSON.insta_creator_api_error = "Missing required parameters.";
        return input.sourceJSON;
    }

    var sourceJSON = input.sourceJSON;
    var accessToken = input.accessToken;
    var creatorName = input.creatorName;

    sourceJSON.insta_creator_api_details = sourceJSON.insta_creator_api_details || {}; // Empty creator details

    // If userIdOrName is empty, skip API request and update SourceJSON
    if (!creatorName || creatorName.trim() === "") {
        sourceJSON.insta_creator_api_status = "skipped";
        sourceJSON.insta_creator_api_error = "creator_name is empty; API request skipped.";
        console.error("creator_name is empty; API request skipped.");
        return sourceJSON;
    }

    // Get the Creator ID from the Instagram API
    var creatorId = null;

    // Define the API endpoint for the Creator ID
    var apiUrlId =
        "https://instagram-premium-api-2023.p.rapidapi.com/v1/user/by/username" +
        "?username=" + creatorName;

    try {
        // Perform an HTTP GET request
        var apiResponse = apiClient.get(apiUrlId, {
            headers: {
                'x-rapidapi-key': accessToken,
		        'x-rapidapi-host': 'instagram-premium-api-2023.p.rapidapi.com'
            },
            // body: JSON.stringify(apiPayload)
        });

        if (debugLevel > 3) {
            console.log("[DEBUG-fetch_instagram_creator_country] Instagram API response: " + JSON.stringify(apiResponse));
        }

        // Handle the response
        var resp = {};
        if (apiResponse.status >= 200 && apiResponse.status < 300) {
            resp = JSON.parse(apiResponse.body);
        } else {
            sourceJSON.insta_creator_api_status = "error";
            sourceJSON.insta_creator_api_error = "Instagram API error: " + apiResponse.status + " " + apiResponse.statusText;
            console.error("Instagram API error: " + apiResponse.status + " " + apiResponse.statusText);
            return sourceJSON;
        }

        creatorId = resp.pk.toString();

        var biography = "";
        if (resp.biography) {
            biography = resp.biography.toString();
        }

        var accountType;
        if (resp.account_type) {
            accountType = resp.account_type;
        }

        var fib;
        if (resp.interop_messaging_user_fbid) {
            fib = resp.interop_messaging_user_fbid.toString();
        }

        var category;
        if (resp.category) {
            category = resp.category.toString();
        }

        var email;
        if (resp.public_email) {
            email = resp.public_email.toString();
        }

        var isVerified = false;
        if (resp.is_verified) {
            isVerified = resp.is_verified;
        }

        var followerCount = 0;
        if (resp.follower_count) {
            followerCount = resp.follower_count;
        }

        var followingCount = 0;
        if (resp.following_count) {
            followingCount = resp.following_count;
        }

        var mediaCount = 0;
        if (resp.media_count) {
            mediaCount = resp.media_count;
        }

        var profilePicUrl = "";
        if (resp.profile_pic_url) {
            profilePicUrl = resp.profile_pic_url.toString();
        }

        var contactPhoneNumber = "";
        if (resp.contact_phone_number) {
            contactPhoneNumber = resp.contact_phone_number.toString();
        }

        sourceJSON.insta_creator_api_details = {
            biography: biography || "",
            creator_id: creatorId || "",
            account_type: accountType,
            fib: fib,
            category: category,
            email: email,
            is_verified: isVerified,
            follower_count: followerCount,
            following_count: followingCount,
            media_count: mediaCount,
            profile_pic_url: profilePicUrl,
            contact_phone_number: contactPhoneNumber,
        };

        sourceJSON.insta_creator_api_status = "success";
        sourceJSON.insta_creator_api_error = "";

    } catch (error) {
        // Handle unexpected errors
        sourceJSON.insta_creator_api_status = "error";
        sourceJSON.insta_creator_api_error = "Unexpected error: " + error.message;
        return sourceJSON;
    }

    if (creatorId === null) {
        sourceJSON.insta_creator_api_status = "error";
        sourceJSON.insta_creator_api_error = "Creator ID not found.";
        return sourceJSON;
    }

    // Get the Creator Country from the Instagram API
    var apiUrlCountry =
        "https://instagram-premium-api-2023.p.rapidapi.com/v1/user/about" +
        "?id=" + creatorId;
    try {
        // Perform an HTTP GET request
        var apiResponse = apiClient.get(apiUrlCountry, {
            headers: {
                'x-rapidapi-key': accessToken,
		        'x-rapidapi-host': 'instagram-premium-api-2023.p.rapidapi.com'
            },
            // body: JSON.stringify(apiPayload)
        });
        if (debugLevel > 3) {
            console.log("[DEBUG-fetch_instagram_creator_country] " + JSON.stringify(apiResponse));
        }

        // Handle the response
        if (apiResponse.status >= 200 && apiResponse.status < 300) {
             var apiResponseBody = JSON.parse(apiResponse.body);

             sourceJSON.insta_creator_api_details.country = apiResponseBody.country;
             sourceJSON.insta_creator_api_status = "success";
             sourceJSON.insta_creator_api_error = "";
        } else {
             sourceJSON.insta_creator_api_details.country = "";
             sourceJSON.insta_creator_api_status = "error";
             sourceJSON.insta_creator_api_error = "Instagram API error: " + apiResponse.status + " " + apiResponse.statusText;
        }
    } catch (error) {
        // Handle unexpected errors
        sourceJSON.insta_creator_api_details.country = "";
        sourceJSON.insta_creator_api_status = "error";
        sourceJSON.insta_creator_api_error = "Unexpected error: " + error.message;
    }

    // Log the modified sourceJSON
    if (debugLevel > 4) {
        console.log("[DEBUG-fetch_instagram_creator_country] Final sourceJSON:", JSON.stringify(sourceJSON, null, 2));
    }

    // Always return the updated SourceJSON
    return sourceJSON;
}

// Run the function
var result = fetch_instagram_creator_country({
    sourceJSON: params.json_data,                    // The current JSON object in the Rule
    accessToken: params.accessToken,                // The Instagram API access token
    creatorName: params.json_data.creator_name       // The Instagram user ID or username (can't be empty)
});
// Ensure the function is called
result;
