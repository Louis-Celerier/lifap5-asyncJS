function renderMyAnswer() {
  console.debug(`@renderMyAnswer()`);
  let bloc_reponse = document.getElementById('id-my-answers');
  let div_reponse = bloc_reponse.children[0];
  div_reponse.innerHTML = "";
  if(state.user) {
    const url = `${state.serverUrl}/users/answers`;
    fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      data.map((data2) => {
        div_reponse.innerHTML += `<div  id="${data2.quiz_id}"><h3>${data2.title}</h3><h5>${data2.description}</h5><div>`;
        const url2 = `${state.serverUrl}/quizzes/${data2.quiz_id}/questions/`;
        fetch(url2, { method: 'GET', headers: state.headers })
        .then(filterHttpResponse)
        .then((data3) => {
          state.answers = data3;
          div_reponse = document.getElementById(data2.quiz_id);
          data3.map((question) => {
            div_reponse.innerHTML += `<hr/><p>${question.sentence}</p><hr/>`;
            question.propositions.map((contenu) => {
              if(data2.answers[question.question_id].proposition_id == contenu.proposition_id){
                if(data2.answers[question.question_id].proposition_id == question.correct_propositions_number)
                  div_reponse.innerHTML += `<p class="teal-text text-lighten-2"><i class="material-icons">check</i> ${contenu.content}</p>`;
                else
                  div_reponse.innerHTML += `<p class="red-text text-lighten-2"><i class="material-icons">clear</i>  ${contenu.content}</p>`;
              }
              else
                div_reponse.innerHTML += `<p><i class="material-icons">chevron_right</i>  ${contenu.content}</p>`;
            });
          });
        });
      })
    });
  }
  else
    div_reponse.innerHTML = "Veuillez vous connecter...";
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
    alert(`Création de "${packet.title}" : Ok`);
  })
  .catch((err) => alert(`Echec de la création de "${packet.title}"\nRaison :\n${err}`));
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
    .then(renderMyQuizzes);
  })
  .catch((err) => alert(`Echec de l'ajout de la question\nRaison :\n${err}`));
}
