"use strict";
class EventDetails {
    ShowEvent = false;
    Title = "";
    ShortDescription = "";
    FullDescription = "";
    Town = "";
    Location = "";
    ShowDate = new Date();
    DoorTime = null;
    StartTime = null;
    EndTime = null;
    TicketLink = null;
}
document.addEventListener("DOMContentLoaded", InitPage);
function InitPage() {
    let excelLocationCSV = new URL("https://docs.google.com/spreadsheets/d/e/2PACX-1vRBjp_krL1yLMOpXHTfLsBMqD85ivI_aguisYMGJAk4ctP2fn2bSHobbjbZ3TEi2qs7BaxwaHuIQnEG/pub?output=csv");
    let localFile = new URL("/data/TestData.csv", window.origin);
    let fileURL = window.origin.indexOf("localhost") == -1 ? excelLocationCSV : localFile;
    let eventDataClient = new XMLHttpRequest();
    eventDataClient.onerror = function (e) { console.log(this, e, "Error"); };
    eventDataClient.onloadend = DataLoaded;
    eventDataClient.open("GET", fileURL);
    eventDataClient.send();
}
function DataLoaded(e) {
    let fileContent = this.responseText;
    let firstNewLine = fileContent.indexOf("\r\n");
    let header = fileContent.substring(0, firstNewLine);
    let headerItems = header.split(",");
    let body = fileContent.substring(firstNewLine + 2);
    let bodyItems = body.split("\r\n");
    let formattedBodyItems = [];
    for (let i = 0; i < bodyItems.length; i++) {
        let individualItems = bodyItems[i].split(",");
        let finalItems = [];
        let itemToAdd = "";
        let inSubString = false;
        for (let j = 0; j < individualItems.length; j++) {
            let currentItem = individualItems[j];
            if (!inSubString) {
                itemToAdd = currentItem;
            }
            else {
                itemToAdd += currentItem;
                if (currentItem.charAt(currentItem.length - 1) == "\"") {
                    inSubString = false;
                }
                else {
                    continue;
                }
            }
            if (currentItem.charAt(0) == "\"") {
                inSubString = true;
                continue;
            }
            finalItems.push(itemToAdd);
            itemToAdd = "";
            inSubString = false;
        }
        formattedBodyItems.push(finalItems);
    }
    let showEventIndex = headerItems.indexOf("Show Event");
    let titleIndex = headerItems.indexOf("Title");
    let shortDescriptionIndex = headerItems.indexOf("Short Description");
    let fullDescriptionIndex = headerItems.indexOf("Full Description");
    let townIndex = headerItems.indexOf("Town");
    let locationIndex = headerItems.indexOf("Location");
    let dateIndex = headerItems.indexOf("Date");
    let doorTimeIndex = headerItems.indexOf("Door Time");
    let startTimeIndex = headerItems.indexOf("Start Time");
    let endTimeIndex = headerItems.indexOf("End Time");
    let ticketLinkIndex = headerItems.indexOf("Ticket Link");
    let allEvent = [];
    for (let i = 0; i < formattedBodyItems.length; i++) {
        let dataItem = formattedBodyItems[i];
        let eventItem = new EventDetails();
        eventItem.ShowEvent = dataItem[showEventIndex] == "TRUE";
        eventItem.Title = dataItem[titleIndex];
        eventItem.ShortDescription = dataItem[shortDescriptionIndex];
        eventItem.FullDescription = dataItem[fullDescriptionIndex];
        eventItem.Town = dataItem[townIndex];
        eventItem.Location = dataItem[locationIndex];
        eventItem.ShowDate = parseDate(dataItem[dateIndex]);
        eventItem.DoorTime = parseTime(dataItem[doorTimeIndex], eventItem.ShowDate);
        eventItem.StartTime = parseTime(dataItem[startTimeIndex], eventItem.ShowDate);
        eventItem.EndTime = parseTime(dataItem[endTimeIndex], eventItem.ShowDate);
        try {
            eventItem.TicketLink = new URL(dataItem[ticketLinkIndex]);
        }
        catch {
            eventItem.TicketLink = null;
        }
        allEvent.push(eventItem);
    }
    createTable(allEvent);
}
function parseDate(dateString) {
    let splitDates = dateString.split("/");
    let day = parseInt(splitDates[0]);
    let month = parseInt(splitDates[1]);
    let year = parseInt(splitDates[2]);
    return new Date(year, month, day);
}
function parseTime(timeString, baseDate) {
    let splitTimes = timeString.split(":");
    let hour = parseInt(splitTimes[0]);
    let minute = parseInt(splitTimes[1]);
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDay(), hour, minute);
}
function createTable(events) {
    let eventsContainer = document.getElementById("eventsContainer");
    if (eventsContainer == null) {
        console.log("No container");
        return;
    }
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (event.ShowEvent == false) {
            continue;
        }
        let elem = document.createElement("div");
        let titleText = document.createElement("h2");
        titleText.textContent = event.Title;
        let dateText = document.createElement("h3");
        dateText.textContent = event.ShowDate.toDateString() + " @" + event.StartTime?.getHours() + ":" + event.EndTime?.getMinutes();
        let ticketLink = document.createElement("a");
        ticketLink.textContent = "TICKETS";
        ticketLink.href = event.TicketLink?.toString() ?? "";
        let descriptionText = document.createElement("p");
        descriptionText.innerHTML = event.FullDescription.replaceAll("\n", "<br/>");
        elem.append(titleText);
        elem.append(dateText);
        elem.append(ticketLink);
        elem.append(descriptionText);
        elem.append(document.createElement("hr"));
        eventsContainer.append(elem);
    }
    let elem = document.createElement("div");
}