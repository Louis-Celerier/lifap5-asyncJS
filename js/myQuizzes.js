function renderMyQuizzes() {
  console.debug(`@renderMyQuizzes()`);
  if(state.user) {
    const url = `${state.serverUrl}/users/quizzes`;
    fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      state.myQuizzes = data;
    });
  }
}

function ajoutQuizz() {
  console.debug(`@ajoutQuizz()`);
  const packet = {
    "title": document.getElementById('title').value,
    "description": document.getElementById('description').value,
  }
  const url = `${state.serverUrl}/quizzes/`;
  fetch(url, { method: 'POST', headers: state.headers, body: JSON.stringify(packet)})
  .then(filterHttpResponse2)
  .then((data) => {
    renderMyQuizzes();
    state.currentQuizz = data.quiz_id;
    renderCurrentQuizz();
    alert(`Création de "${packet.title}" : Ok`);
  })
  .catch((err) => {
    M.toast({html: `Echec de la création de "${packet.title}"`})
    M.toast({html: err});
  });
}

function ajoutFormQuestion(quiz_id, question_id) {
  console.debug(`@ajoutFormQuestion(${quiz_id}, ${question_id})`);
  let button = document.getElementById(`${quiz_id}-button`);
  button.style.visibility = "hidden";
  button.disabled = true;
  let div = document.getElementById(quiz_id);
  div.innerHTML += `<div>
    <div id="${quiz_id}-div-ajout-question" class="row">
      <div class="input-field col s8">
        <i class="material-icons prefix">question_answer</i>
        <input disabled id="${quiz_id}-question" type="text" class="validate">
        <label for="${quiz_id}-question">Question</label>
      </div>
      <div id="proposition-div" class="input-field col s3">
          <input id="${quiz_id}-nb-proposition" type="number" value=2 min=2 max=10 class="validate">
          <label class="active" for="${quiz_id}-nb-proposition">Nombre de proposition</label>
          <span class="helper-text" data-error="wrong" data-success="right">Etat</span>
      </div>
      <div>
        <a class="btn-floating btn-large waves-effect waves-light" name="action" onclick="ajoutProposition(${quiz_id}, ${question_id})" id="${quiz_id}-btn-proposition">
          <i class="material-icons right">add</i>
          </a>
      </div>
    </div>
    <br/>
  </div>`;
}

function ajoutProposition(quiz_id, question_id) {
  console.debug(`@ajoutProposition(${quiz_id}, ${question_id})`);
  document.getElementById(`${quiz_id}-question`).disabled = false;
  let proposition = document.getElementById(`${quiz_id}-btn-proposition`);
  proposition.remove();
  let nb_proposition = document.getElementById(`${quiz_id}-nb-proposition`).value;
  document.getElementById('proposition-div').remove();
  let question_div = document.getElementById(`${quiz_id}-div-ajout-question`);
  for (let i = 0; i < nb_proposition; i++) {
    question_div.innerHTML += `<div class="input-field col s7">
        <input name="${quiz_id}" type="text" class="validate">
        <label class="active" for="nb-proposition">Proposition ${i+1}</label>
    </div>
    <div class="input-field col s3">
      <p>
        <label>
          <input name="${quiz_id}-correct" id="${quiz_id*100 + i}" type="radio" checked/>
          <span>Bonne Reponse</span>
        </label>
      </p>
    </div>`;
    }
    question_div.innerHTML += `<div class="col s12">
      <button class="btn waves-effect waves-light deep-purple lighten-2" type="submit" name="action" onclick="ajoutQuestion(${quiz_id}, ${question_id})" id="${quiz_id}-envoi">
        Soumettre
        <i class="material-icons right">send</i>
        </button>
    </div>`;
}

function ajoutQuestion(quiz_id, question_id) {
  console.debug(`@ajoutQuestion(${quiz_id}, ${question_id})`);
  let packet = {};
  let packet2 = {};
  packet2.title = document.getElementById(quiz_id).childNodes[1].textContent;
  packet2.description = document.getElementById(quiz_id).childNodes[3].textContent;
  packet2.open = true;
  let id = 0;
  packet.question_id = question_id;
  packet.sentence = document.getElementById(`${quiz_id}-question`).value;
  packet.propositions = [];
  let propositions = document.getElementsByName(quiz_id);
  propositions.forEach((content) => {
    packet.propositions.push({
      content: content.value,
      proposition_id: id,
      correct: document.getElementById(`${quiz_id*100 + id}`).checked
    });
    id++;
  });
  const url = `${state.serverUrl}/quizzes/${quiz_id}/questions/`;
  fetch(url, { method: 'POST', headers: state.headers, body: JSON.stringify(packet)})
  .then(filterHttpResponse2)
  .then((data) => {
    alert(`Création de "${packet.sentence}" : Ok`);
    const url2 = `${state.serverUrl}/quizzes/${quiz_id}/`;
    fetch(url2, { method: 'PUT', headers: state.headers, body: JSON.stringify(packet2)})
    .then(filterHttpResponse)
    .then(() => {renderMyQuizzes(); renderCurrentQuizz();});
  })
  .catch((err) => M.toast({html: `Echec de l'ajout de la question\nRaison :\n${err}`}));
}

let renderAjoutBtn = document.getElementById("ajoutQuizz");
renderAjoutBtn.onclick = () => {
  document.getElementById('id-all-quizzes-main').innerHTML = `<div class="row col s6" style="position:fixed">
    <h2>Nouveau Quizz</h2>
    <div class="input-field col s12">
      <i class="material-icons prefix">title</i>
      <input id="title" type="text" class="validate">
      <label for="title">Titre</label>
    </div>
    <div class="input-field col s12">
      <i class="material-icons prefix">description</i>
      <input id="description" type="text" class="validate">
      <label for="description">Description</label>
    </div>
    <div>
      <button class="btn waves-effect waves-light" type="submit" name="action" onclick="ajoutQuizz()" id="nouveau_quizz">
        Créer
        <i class="material-icons right">create</i>
      </button>
    </div>
  </div>`;
}
