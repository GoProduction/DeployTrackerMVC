# Overview of DeployTrackerMVC
The main function of this program is to help assist the communication between the developers and the QA team. Currently, both teams use a chat client to communicate not only issues, but callouts of deploys and "smoke" pass status'. On a busy day, things can start to get lost in translation, requiring both teams to scroll through the chat log to determine the status of deploys/smokes. This program will help close that gap, as its sole purpose is to display the status of deploy rollouts in tabular form, WITH an added bonus: IN REAL TIME!

## The Calendar
<img src="/readme_images/Calendar.png">

The calendar is used to display the planned dates of the deploys using ribbons, as well as their status via color-code.

Color | Status
------|-------
Blue | Queued
Yellow | Deploying
Green | Completed
Red | Failed

Selecting a ribbon will prompt a modal that displays a brief summary of the deploys details.
<img src="/readme_images/HomeModal.JPG">
