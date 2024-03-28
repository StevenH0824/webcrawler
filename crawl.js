const{JSDOM} = require('jsdom')

async function crawlPage(baseURL, currentURL, pages){
    
    const baseURLObj = new URL(baseURL)
    const currentURLObj = new URL(currentURL)
    
    if (baseURLObj.hostname !== currentURLObj.hostname){
        return pages
    }

    const normalizedCurrentURL = normalizeURL(currentURL)
    if (pages[normalizedCurrentURL] > 0){
        pages[normalizedCurrentURL]++
        return pages
    }
    
    pages[normalizedCurrentURL] = 1
    
    console.log("Active crawling: " + currentURL +".")
    try{
        const resp = await fetch(currentURL)
        if (resp.status > 399){
            console.log("Error in fetch:\t" + "Status code " + resp.status + "on page " + currentURL)
            return pages
        }
        
        const contentType = resp.headers.get("content-type")
        if (!contentType.includes("text/html")){
            console.log("Non html response, content type:" + contentType + " on page " + currentURL)
            return pages
        }
        const htmlBody = await resp.text()

        const nextURLs = getURLsFromHTML(htmlBody,baseURL)

        for (const nextURL of nextURLs){
            pages = await crawlPage(baseURL,nextURL,pages)
        }
    } catch (err){
        console.log("Error in fetch:\t" + err.message + " on page " + currentURL)    
    }
    return pages
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
                console.log("Error with Relative Url:\t" + err.message)
            }
        }else{
            try{
                const urlObj = new URL(linkElement.href)
                urls.push(urlObj.href)
            } catch (err){
                console.log("Error with Absolute Url:\t" + err.message)
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