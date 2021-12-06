let params = new URLSearchParams(window.location.search);
let id = params.get('id');
let type = params.get('type');
let idType = (type === 'student') ? 'studtId': 'teachId';
let showInfoEle = document.querySelector('[data-std-info]');

const template = ({studtId, teachId, name, branchCode, id}) => {
  let temp = `
    <div class="user-info">
      <span class="info-title">name</span>
      <span data-std-name="">${name.first} ${name.last}</span>
    </div>
    <div class="user-info">
      <span class="info-title">${type} ID</span>
      <span data-std-id="">${studtId || teachId}</span>
    </div>
    <div class="user-info">
      <span class="info-title">slip code</span>
      <span data-slip-code="">${branchCode}${id}</span>
    </div>
  `;
  return temp;
};

const showStudtDetails = async () => {
  try {
    let req = await fetch(`http://localhost:3000/${type}s/?${idType}=${id}`);
    let res = await req.json();
    let [ std ] = res;
    // show student's info in dom element
    const stdInfo = document.querySelector('[data-std-info]');
    const slipCode = document.querySelector('.slip-code');
    const slipDate = document.querySelector('.slip-date');
    const slipTitle = document.querySelector('[data-slip-title]');

    slipTitle.innerHTML = (type === 'student') ? 'student': 'teacher';
    stdInfo.innerHTML = template(std);
    slipCode.innerHTML = `std-${std.branchCode}${std.id}`;
    slipDate.innerHTML = new Date().toLocaleDateString();
  } catch (err) {
    console.error(err.message)
  }
};

const closeModal = () => {
  const modal = document.querySelector('.modal');
  const modalContent = document.querySelector('.modal-content');
  const ctaBtnContainer = document.querySelector('[data-cta-btn-container]');
  // hide modal window & show C.T.A btn container
  // with consideration of modal animation time-frame
  modalContent.classList.toggle('modal-hide-anim');
  setTimeout(() => {
    modal.classList.toggle('hide-modal');
    modalContent.classList.toggle('modal-hide-anim');
    ctaBtnContainer.classList.toggle('hide');
  }, 1000);
};

const proceedPrintBtn = () => {
  const ctaBtnContainer = document.querySelector('[data-cta-btn-container]');
  const modal = document.querySelector('.modal');
  // hide C.T.A btn container & show the modal window for printing
  ctaBtnContainer.classList.toggle('hide');
  modal.classList.toggle('hide-modal');
};

const printId = () => {
  const modal = document.querySelector('.modal');
  const modalContent = document.querySelector('.modal-content');

  // after 1sec. hide modal and print the generated ID
  modalContent.classList.toggle('modal-hide-anim');
  setTimeout(() => {
    modalContent.classList.toggle('modal-hide-anim');
    modal.classList.toggle('hide-modal');
    window.print();
  }, 1000);
};

const afterPrintId = () => {
  const ctaBtnContainer = document.querySelector('[data-cta-btn-container]');
  const backHomeBtn = document.querySelector('[data-back-home-btn]');
  // show C.T.A btn container & the back home btn link
  ctaBtnContainer.classList.toggle('hide');
  backHomeBtn.classList.toggle('hide');
  console.log('ID printed successfully! 😀👍✔');
};

const goBackHome = () => {
  // redirect user back to the home page('index.html' or '/')
  window.location.replace('/');
};

/* ====== Event listeners ====== */ 
window.addEventListener('DOMContentLoaded', () => showStudtDetails());

window.addEventListener('afterprint', () => afterPrintId());