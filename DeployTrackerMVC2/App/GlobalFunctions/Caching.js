/*Filter Cache
 *These variables will be used for the table filters for both QA and Developer pages
*/
//Global variables
var smokeState;
var smokeWindow = document.getElementById("smokeWindow");
var smokeButton = document.getElementById("smokeToggleButton");
var objstatus = '';
var selID = '';

//Cache Variables
////Current Deploys
//////Type
var ctStore = localStorage['curTypeCached'];
if (ctStore) var curTypeCached = JSON.parse(ctStore);
else curTypeCached = { val: 'All' };
console.log("curTypeCached is");
console.log(curTypeCached);
//////Time
var ctmStore = localStorage['curTimeCached'];
if (ctmStore) var curTimeCached = JSON.parse(ctmStore);
else curTimeCached = { val: '24' };
console.log("curTimeCached is");
console.log(curTimeCached);

////Smoke Deploys
//////Type
var stStore = localStorage['smokeTypeCached'];
if (stStore) var smokeTypeCached = JSON.parse(stStore);
else smokeTypeCached = { val: 'All' };
console.log("smokeTypeCached is ");
console.log(smokeTypeCached);
//////Time
var stmStore = localStorage['smokeTimeCached'];
if (stmStore) var smokeTimeCached = JSON.parse(stmStore);
else smokeTimeCached = { val: '24' };
console.log('smokeTimeCached is ');
console.log(smokeTimeCached);