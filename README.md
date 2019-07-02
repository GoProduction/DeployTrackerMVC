# Overview of DeployTrackerMVC
The main function of this program is to help assist the communication between the developers and the QA team. Currently, both teams use a chat client to communicate not only issues, but callouts of deploys and "smoke" pass status'. On a busy day, things can start to get lost in translation, requiring both teams to scroll through the chat log to determine the status of deploys/smokes. This program will help close that gap, as its sole purpose is to display the status of deploy rollouts in tabular form, WITH an added bonus: IN REAL TIME!

## The Calendar
<img src="/readme_images/Calendar.png">

The calendar, powered by DayPilot Lite, is used to display the planned dates of the deploys using ribbons, as well as their status via color-code.

Color | Status
------|-------
Blue | Queued
Yellow | Deploying
Green | Completed
Red | Failed



Selecting a ribbon will prompt a modal that displays the deploys details.

<img src="/readme_images/HomeModal.JPG">

## The Developer Page
<img src="/readme_images/Developer.JPG">

The developer page is separated by two tables: Queued Deploys (bottom) and Current Deploys (top). Each table allows for easy access to Edit, View, and change the status of the deploy. Whenever a deploy is created, it will automatically assume the status of "Queued", and will be displayed in the Queued Deploys table. When the status of the deploy is changed, it will then transfer over to the Current Deploys table.


The status of the deploy can be changed by selecting the "Update Status" button in the deploy field.

<img src="/readme_images/DeveloperStatusModal.JPG">

Selecting a deploy within a table will open the deploy details window of the selected deploy.

<img src="/readme_images/RecordDetails.JPG">
