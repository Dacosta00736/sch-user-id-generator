// for getting DOM element with css query selector
const query = (ele, cssQuery) => {
  return ele.querySelector(cssQuery);
};

// for getting all DOM element with css query selector
const queryAll = (ele, cssQuery) => {
  return ele.querySelectorAll(cssQuery);
};

// for handling navbar tab menus
const navbar = (event) => {
  const navMenu = queryAll(document, '.nav-tab');
  const navItems = queryAll(document, '[data-tab-item]');

  let tabLink = event.target.dataset.tabLink;
  let menuItems = Array.from(navItems);
  // remove active class in all nav menu & items
  navMenu.forEach(ele => ele.classList.remove('active'));
  navItems.forEach(ele => ele.classList.remove('active-tab-item'));
  // add active class to the menu clicked on & show the item
  let menuItem = menuItems.find(ele => ele.dataset.tabItem === tabLink);
  menuItem.classList.add('active-tab-item');
  event.target.classList.add('active');
};

// help abbreviate name
const abbrvName = (name) => {
  let splitNm = name.split(' ');
  let ft = splitNm[0][0].toUpperCase();
  let lst = splitNm[1][0].toUpperCase();
  let formatName = {};
  // given that provided name is more than two
  if( splitNm.length > 2 ) {
		lst = splitNm[2][0].toUpperCase();
    formatName.showName = `${splitNm[0]} ${splitNm[1][0]} ${splitNm[2]}`;
  } else{
    formatName.showName = `${splitNm[0]} ${splitNm[1]}`;
  }

  formatName.abbrv = `${ft}${lst}`;
  return formatName;
};

/* for registered section */
const listItemTemplate = ({id, studtId, teachId, name, branchCode}) => {
  let idType = (studtId) ? 'student': 'teacher';
  let { first, last } = name;
  let { showName } = abbrvName(`${first} ${last}`);
  
  let temp = `
    <div class="list-item">
      <div class="list-action">
        <span onclick="deleteListItem(event)" data-delete-item="${id}" style="transition-delay: 0.7s;">
          🗑
        </span>
        <span onclick="editListItem(event)" data-edit-item="${id}" style="transition-delay: 0.5s;">
          🖊
        </span>
        <span onclick="printListItem(event)" data-print-item="${studtId || teachId}">
          🖨
        </span>
      </div>
      <div class="list-details">
      <div>
        <div class="sm-header">name</div>
          <span data-item-name="${showName}">${showName}</span>
        </div>
        <div>
          <div class="sm-header">ID</div>
          <span data-item-id="${studtId || teachId}">${studtId || teachId}</span>
        </div>
        <div>
          <div class="sm-header">type</div>
          <span data-item-type="${idType}">${idType}</span>
        </div>
        <div>
          <div class="sm-header">code</div>
          <span data-item-code="${branchCode}${id}">${branchCode}${id}</span>
        </div>
        <span class="item-action" onclick="showListItemAction(event)">&#8942;</span>
      </div>
    </div>
  `;

  return temp;
};

const showListItemAction = (event) => {
  const parentEle = event.target.parentElement;
  const listActions = parentEle.previousElementSibling.children;
  // the action button elements
  let [deleteAction, editAction, printAction] = listActions;

  parentEle.classList.toggle('slide-detail');
  deleteAction.classList.toggle('show-action');
  editAction.classList.toggle('show-action');
  printAction.classList.toggle('show-action');
};

const deleteListItem = async (event) => {
  const parentEle = event.target.parentElement.parentElement;
  const listItem = parseInt(event.target.dataset.deleteItem);
  let itemType = event.target.parentElement.nextElementSibling;
  itemType = query(itemType, '[data-item-type]').dataset.itemType;

  try {
    let uri = `http://localhost:3000/${itemType}s/${listItem}`;
    let reqOpt = { method: "DELETE" };

    // delete item from the prefered database
    let req = await fetch(uri, reqOpt);
    if (req.status === 404) {
      console.error(`No such user! ${listItem}`);
      return;
    }
    // remove the item from the dom
    parentEle.remove();

    console.log(`item: "${listItem}" is successfully removed!`);
  } catch (err) {
    console.error(err.message);
  }
};

const editListItem = async (event) => {
  const listDetails = event.target.parentElement.nextElementSibling;
  const listItem = parseInt(event.target.dataset.editItem);
  let itemName = query(listDetails, '[data-item-name]').innerHTML;
  let itemType = query(listDetails, '[data-item-type]').innerHTML;
  // get new updated name
  let userName = prompt(`Please change your name "${itemName}"`);

  // exit funtion if no name is supplied
  if(!userName) return;

  // format how name is to be saved in database & shown in the DOM
  let nm = userName.split(' ');
  let first = nm[0];
  let last = (nm.length > 2) ? `${nm[1]} ${nm[2]}`: nm[1];
  let { showName } = abbrvName(`${first} ${last}`);
  let saveName = {
    name: { first, last }
  };

  // let userId = (itemType === 'student') ? 'studtId': 'teachId';
  // update the database with new name & the DOM element showing name
  try {
    let uri = `http://localhost:3000/${itemType}s/${listItem}`;
    let reqOpt = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'manual',
      body: JSON.stringify(saveName)
    };
    let req = await fetch(uri, reqOpt);
    let res = await req.json();

    query(listDetails, '[data-item-name]').innerHTML = showName;
    console.log(res);
  } catch (err) {
    console.error(err.message);
  }
};

const printListItem = (event) => {
  const listDetails = event.target.parentElement.nextElementSibling;
  const listItem = event.target.dataset.printItem;
  let itemType = query(listDetails, '[data-item-type]').innerHTML;

  // redirect user to the user.html page for re-print
  window.location.replace(`/user.html?id=${listItem}&type=${itemType}`);
  console.log(listItem)
};

const getAllUsers = async () => {
  const studtURI = 'http://localhost:3000/students';
  const teachURI = 'http://localhost:3000/teachers';
  let reqOpt = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  let getStudts = fetch(studtURI, reqOpt).then(res => res.json());
  let getTeachs = fetch(teachURI, reqOpt).then(res => res.json());

  try {
   return Promise.all([getStudts, getTeachs])
    .then(res => {
      let [stds, tchs] = res;
      return { students: stds, teachers: tchs };
    });
  } catch (err) {
    console.error(err.message);
  }
};

const showAllUsers = async () => {
  const showListContainer = query(document, '[data-reg-ids]');
  const users = await getAllUsers();
  let { students, teachers } = users;
  let allUsers = [...students, ...teachers];
  // show all registered users in the DOM element
  showListContainer.innerHTML = '';
  allUsers.forEach(user => {
    showListContainer.innerHTML += listItemTemplate(user);
  });
};
/* for registered section ends */

// generate random number within provided minimum & maximum limit
const genRadNum = (min, max) => {
  let result = Math.round(Math.random() * (max - min)) + min;
  // add two preceeding '00's before single value
  if (result.toString().length === 1) {
    result = `00${result}`;
  }
  // add one preceeding '0' before double value
  if (result.toString().length === 2) {
    result = `0${result}`;
  }

  return result;
};

// generate student id
const genStudtId = (studtName, admYr, branchCode) => {
  let idFormat = '', genId = (genRadNum(1, 999)).toString();

  // format name letters to use from student's name(fullname)
  let { firstName, lastName } = studtName;
  let nameAbrr = (firstName[0] + lastName[0]).toUpperCase();

  // format admission year to use
  let admissionYear = (!admYr) ? new Date().getFullYear() : admYr;
  admissionYear = admissionYear.toString().slice(2, admissionYear.toString().length);
  
  // format for student id
  idFormat = `${admissionYear}${branchCode}${genId}${nameAbrr}`;

  return idFormat;
};

// help check/verify if provided generated id not already in DB(should return true/false)
const verifyStudtId = (stdDBIds, stdid) => {
  // return true/false
  let verify = stdDBIds.some((id) => id === stdid);
  return verify;
};

// help re-generate new ids not previously existed in students DB
const reGenIds = async ({ numOfIds, studtName, teachName, admYr, empYr, branchCode }) => {
  let newUsersId = '', newIdArr = [], newIds = [];
  let usersName = studtName || teachName;
  let usersYr = admYr || empYr;
  let usersDB = (studtName) ? 'students': 'teachers';
  let usersId = (studtName) ? 'studtId': 'teachId';
  // generate new ids according to total count provided in function parameter
  for(let i = 0; i < numOfIds; i++) {
    newIdArr.push(genStudtId(usersName, usersYr, branchCode));
  }

  try {
    // get students/teachers db
    let req = await fetch(`http://localhost:3000/${usersDB}`);
    let res = await req.json();

    // get all students/teachers ids in db
    let idDB = [];
    res.forEach(ids => idDB.push(ids[usersId]));

    // filter out those ids not already in db
    newIdArr.forEach(id => {
      if (verifyStudtId(idDB, id) === false) {
        newIds.push(id);
      }
    });
    
    // select one out of out of filtered
    newUsersId = newIds[Math.floor(Math.random() * (newIds.length - 1))];
    
    return newUsersId;
  } catch (error) {
    console.error(error.message);
  }
};

// help fetch data from DB API
const getDataFrmDB = async (dbName) => {
  let uri = `http://localhost:3000/${dbName}`;

  try {
    let req = await fetch(uri);
    let res = await req.json();
    return res;
  } catch (error) {
    console.error(error.message);
  }
};

// help create data into DB API
const storeDataInDB = async (dbName, dataObj) => {
  // db api uri
  let uri = `http://localhost:3000/${dbName}`;

  let reqOpt = {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataObj),
    redirect: 'manual'
  };

  // create the data in specified dbName in function parameter
  try {
    let req = await fetch(uri, reqOpt);
    let res = await req.json();
    return res;
  } catch (err) {
    console.error(err);
  }
};

// create for account with generated id for student
const createStudtAcc = async ({studtName, admYr, branchCode}) => {
  // generate student id
  const stdId = genStudtId(studtName, admYr, branchCode);
  let testDB = [];
  // format data according to db's data structure
  let storeData = {
    studtId: '',
    name: { first: studtName.firstName, last: studtName.lastName },
    branchCode
  };
  // store data in student's db
  try {
    // get all ids in specified db & filter it into an array variable
    let studtDB = await getDataFrmDB('students');
    studtDB.forEach(std => testDB.push(std.studtId));
    
    // check if any is found within the array of ids
    let verify = verifyStudtId(testDB, stdId);

    if(verify === false) {
      // add generated id into the storeData obj variable.
      storeData.studtId = stdId;
      
      // save data into the db
      await storeDataInDB('students', storeData);
      // redirect to user's page to show student's details
      window.location.replace(`/user.html?id=${stdId}&type=student`);
    } else {
      /* note: (if id already exist)
      => re-generate 5 random ids and check if non exist
      => assign anyone of them that pass the above check
      => then proceed to the last step(add id into db)
     */
      let regen = await reGenIds({numOfIds: 5, studtName, admYr, branchCode});
      storeData.studtId = regen;

      // save data into the db
      await storeDataInDB('students', storeData);
    
      // redirect to user's page to show student's details
      window.location.replace(`/user.html?id=${regen}&type=student`);
    }
  } catch (error) {
    console.error(error);
  }
};

// create account for teachers
const createTeachAcc = async ({teachName, employmentYr, branchCode}) => {
  const teachId = `T${genStudtId(teachName, employmentYr, branchCode)}`;
  let chkDB = [];
  let storeData = {
    teachId: '',
    name: { first: teachName.firstName, last: teachName.lastName },
    branchCode
  };

  // store data in teacher's db
  try {
    let teachDB = await getDataFrmDB('teachers');
    teachDB.forEach(teach => chkDB.push(teach.teachId));

    let verify = verifyStudtId(chkDB, teachId);

    if (verify === false) {
      // add generated id into the storeData obj variable.
      storeData.teachId = teachId;
      // save data into the db
      await storeDataInDB('teachers', storeData);
      // redirect to user's page to show student's details
      window.location.replace(`/user.html?id=${teachId}&type=teacher`);
    } else {
      let regen = await reGenIds({numOfIds: 5, teachName, empYr: employmentYr, branchCode});
      storeData.teachId = regen;

      // save data into the db
      await storeDataInDB('teachers', storeData);
    
      // redirect to user's page to show student's details
      window.location.replace(`/user.html?id=${regen}&type=teacher`);
    }
  } catch (err) {
    console.error(err); 
  }
};

// help take-in only numbers
const acceptOnlyNum = (event) => {
  const frmInpt = event.target;
  let val = frmInpt.value;
  let pattern = /\d/;
  let lastVal = val[(val.length - 1)];
  let res = pattern.test(lastVal);

  // if it is a number value(reset of code shouldn't evaluate)
  if (res) return;

  // filter our what is not a number & return those that are
  frmInpt.value = val.slice(0, (val.length - 1)) || '';
  
  return;
};

// handle student form
const handleStudtForm = async (event) => {
  // prevent form default behaviour
  event.preventDefault();
  // get all form's inputed data
  let frm = event.target;
  let studtName = {
    firstName: frm.elements.firstName.value,
    lastName: frm.elements.lastName.value
  };
  let admYr = frm.elements.admYr.value;
  let branchCode = frm.elements.branchCode.value;

  // all form data format for creating id
  let frmData = { studtName, admYr, branchCode };

  // create student id & redirect to user.html page show created id
  await createStudtAcc(frmData);
};

// handle teacher's form
const handleTeachForm = (event) => {
  event.preventDefault();
  let frm = event.target;
  let teachName = {
    firstName: frm.elements.firstName.value,
    lastName: frm.elements.lastName.value
  };
  let employmentYr = frm.elements.employmentYr.value;
  let branchCode = frm.elements.branchCode.value;
  let frmData = { teachName, employmentYr, branchCode };

  await createTeachAcc(frmData);
};

// student's form
const studtFrm = query(document, '#studt-frm');
// teacher's form
const teachFrm = query(document, '#teach-frm');

// admission year input
const admYrInpt = query(document, '[data-adm-year]');
// teacher's year of employment input
const employmentYrInpt = query(document, '[data-employment-yr]');


/* ====== Event handlers ====== */
window.addEventListener('DOMContentLoaded', () => showAllUsers());

studtFrm.addEventListener('submit', handleStudtForm);

teachFrm.addEventListener('submit', handleTeachForm);

admYrInpt.addEventListener('input', acceptOnlyNum);

employmentYrInpt.addEventListener('input', acceptOnlyNum);