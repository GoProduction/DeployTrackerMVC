# Overview of DeployTrackerMVC
The main function of this program is to help assist the communication between the developers and the QA team. Currently, both teams use a chat client to communicate not only issues, but callouts of deploys and "smoke" pass status'. On a busy day, things can start to get lost in translation, requiring both teams to scroll through the chat log to determine the status of deploys/smokes. This program will help close that gap, as its sole purpose is to display the status of deploy rollouts in tabular form, WITH an added bonus: IN REAL TIME!

## The Calendar
<img src="/readme_images/Calendar.JPG">

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
<img src="/readme_images/DevImg01.JPG">

The developer page is separated by three tables: Queued Deploys (bottom), Current Deploys (top), and the Smoke Queue (right). Each table allows for easy access to Edit, View, and change the status of the deploy. Whenever a deploy is created, it will automatically assume the status of "Queued", and will be displayed in the Queued Deploys table. When the status of the deploy is changed, it will then transfer over to the Current Deploys table. The Current and Smoke tables also have filters that the user can use to parse deploys by date and status of the deploy.

The status of the deploy can be changed by selecting the "Update Status" button in the deploy field.

<img src="/readme_images/DevImg02.JPG">

If a deploys' status is set to FAILED, the user will be prompted to enter a comment into the comment box. They will not be able to save the status until a comment is entered.

<img src="/readme_images/DevImg03.JPG">

Selecting a deploy within a table will open the deploy details window of the selected deploy, where users can also edit if needed by selecting the 'Edit' button.

<img src="/readme_images/DevImg04.JPG">

## The QA Page
<img src="/readme_images/QaImg01.jpg">

The QA page looks almost identical to the Developer page. Users on this page cannot, however, change the deploy status. When a deploy has been marked as 'Completed', it will then appear in the Smoke Queue, where a user can then change the Smoke Status.

<img src="/readme_images/QaImg02.JPG">

## The New Deploy Page
<img src="/readme_images/NewImg01.jpg">

The New Deploy page is meant for developers to enter and submit the features that will be deployed. Since features (more than likely) will be submitted in queue at the same time, this page was designed to add each feature to a table, and submitted when all features have been entered. This makes it much more efficent than queuing features one-by-one.
