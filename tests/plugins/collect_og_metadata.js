// name: extract_og_metadata
// description: Extracts all "og:xxxxx" metadata tags from the page and returns them as a JSON object.
// type: vdi_plugin

/**
 * Extract Open Graph (og:xxxxx) Metadata
 * @returns {Object} - A JSON object containing the extracted metadata or an error.
 */
return (function extract_og_metadata(win) {
    var result = {};
    try {
        // Get all meta tags in the document
        var metaTags = win.document.getElementsByTagName('meta');
        //console.log("Total meta tags found:", metaTags.length);

        for (var i = 0; i < metaTags.length; i++) {
            var tag = metaTags[i];
            var property = tag.getAttribute('property');
            var content = tag.getAttribute('content');

            // Check if the tag is an Open Graph (og:xxxxx) tag
            if (property && property.startsWith('og:') && content) {
                var key = property.slice(3); // Remove "og:" prefix
                result[key] = content; // Add to the result object
            }
        }

        if (Object.keys(result).length === 0) {
            console.warn("No Open Graph metadata found.");
            return {
                success: false,
                og_metadata: {},
                error: "No Open Graph metadata found in the page."
            };
        }

        return {
            success: true,
            og_metadata: result
        };
    } catch (error) {
        console.error("An error occurred while extracting og:xxxxx metadata:", error.message);
        return {
            success: false,
            og_metadata: {},
            error: "An error occurred: " + error.message
        };
    }
})(window);
