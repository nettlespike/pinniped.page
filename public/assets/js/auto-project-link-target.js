"use strict";

let depth = location.href.replaceAll(/[^\/]+/g, "").length; // get page depth: count the number of slashes
if (location.href.startsWith("https://pinniped.page/"))
	depth -= 3; // subtract three for pinniped.page
else depth -= 4; // subtract four for localhost

// sometimes there are slashes in URL arguments/fragments: discount them
if (location.href.includes("?")) depth -= location.href.substring(location.href.indexOf("?")).replaceAll(/[^\/]+/g, "").length;
else if (location.href.includes("#")) depth -= location.href.substring(location.href.indexOf("#")).replaceAll(/[^\/]+/g, "").length;

let depthString = ""; // set depthString
for (let i = 0; i < depth; i++) depthString += "../";

// get disconnected paths
let paths = [];
try {
	const response = await fetch(new Request(depthString + "assets/json/projects.json"));
	const responseJSON = await response.json();

	for (let project in responseJSON) {
		if (responseJSON[project].path.startsWith("projects/") && !responseJSON[project].connected) paths.push(responseJSON[project].path);
	}
} catch (error) {
	console.error(`%cERROR:`, errorStyle, error); // ruh roh
}

// get the equivalent of the paths in paths[] for any local URL
function getPath(link) {
	// values for live and local
	let domain = link.startsWith("https://pinniped.page/") ? "https://pinniped.page/" : "http://localhost:5500/public/";
	let subtraction = link.startsWith("https://pinniped.page/") ? 0 : 5; // (.html)

	// determine how to remove what comes after the "path" from the URL
	let end = 0;
	if (link.includes("?"))
		end = link.indexOf("?"); // URL argument present
	else if (link.includes("#"))
		end = link.indexOf("#"); // URL fragment present
	else end = link.length; // no URL arguments or fragments

	return link.substring(domain.length, end - subtraction);
}
const from = getPath(location.href);

// test & modify ALL links, starting with internal vs. external
document.querySelectorAll("a").forEach((link) => {
	if (link.href.startsWith("https://pinniped.page/") || link.href.startsWith("http://localhost:5500/public/")) {
		let to = getPath(link.href);
		if (paths.includes(to) && from != to)
			link.setAttribute("target", "_blank"); // internal link to a disconnected project that is not the current page
		else link.removeAttribute("target"); // internal link that is NOT a disconnected project or is to the same page
	} else link.setAttribute("target", "_blank"); // external link
});
