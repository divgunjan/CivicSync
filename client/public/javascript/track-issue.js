


function animateImpactScore(){

  const el = document.getElementById('impact-score');

  let start = 0;

  const end = 87;

  const timer = setInterval(()=>{

    start++;

    el.textContent = start;

    if(start >= end){
      clearInterval(timer);
    }

  },18);

}

animateImpactScore();

function fetchIssue(){

  const id = document.getElementById('track-id').value;

  if(!id.trim()){

    alert('Please enter a complaint ID');

    return;

  }

  alert(
    'Backend API integration will fetch live issue data here.'
  );

}


