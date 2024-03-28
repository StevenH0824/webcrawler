const{JSDOM} = require('jsdom')


function getURLsFromHTML(htmlBody, baseURL){
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll("a")
    
    for (const linkElement of linkElements){
        if (linkElement.href.startsWith("/")){
            
            try{
                const urlObj = new URL(baseURL + linkElement.href)
                urls.push(urlObj.href)
            } catch (err){
                console.log("Error with Relative Url" + err.message)
            }
        }else{
            try{
                const urlObj = new URL(linkElement.href)
                urls.push(urlObj.href)
            } catch (err){
                console.log("Error with Absolute Url" + err.message)
            }
        }
    }
    return urls
}

function normalizeURL(urlString){
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`

    if (hostPath.endsWith("/")){
        return hostPath.slice(0,-1)
    }
    return hostPath
}

module.exports = {
    normalizeURL,
    getURLsFromHTML
}