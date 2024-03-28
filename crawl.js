const{JSDOM} = require('jsdom')

async function crawlPage(currentURL){
    console.log("Active crawling: " + currentURL +".")
    try{
        const resp = await fetch(currentURL)
        console.log(await resp.text())
        if (resp.status > 399){
            console.log("Error in fetch:\t" + "Status code " + resp.status + "on page " + currentURL)
            return
        }

        const contentType = resp.headers.get("content-type")
        if (!contentType.includes("text/html")){
            console.log("Non html response, content type:" + contentType + " on page " + currentURL)
            return
        }

    } catch (err){
        console.log("Error in fetch:\t" + err.message + " on page " + currentURL)    
    }
}


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
    getURLsFromHTML,
    crawlPage
}