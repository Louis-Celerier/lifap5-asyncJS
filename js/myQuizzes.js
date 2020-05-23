function renderMyQuizzes() {
  console.debug(`@renderMyQuizzes()`);
  let bloc_question = document.getElementById('id-my-quizzes');
  let div_question = bloc_question.children[0];
  if(state.user) {
    div_question.innerHTML = `<div class="col s3">
    <div class="row col s3" style="position:fixed">
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
      </div>
    </div>
    <div id="my-quizzes" class="col s9">
      <h2>Quizz Existant :</h2>
    </div>`;
    div_question = document.getElementById('my-quizzes');
    const url = `${state.serverUrl}/users/quizzes`;
    fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      data.map((ordre) => {
        if(ordre.open)
          div_question.innerHTML += `<div id=${ordre.quiz_id}>
          <h3 class="teal-text text-lighten-2">${ordre.title}</h3>
          <h5>${ordre.description}</h5>
          <h6>#${ordre.quiz_id}</h6>
          </div>`;
        else
          div_question.innerHTML += `<div id=${ordre.quiz_id}>
          <h3 class="red-text text-lighten-2">${ordre.title}</h3>
          <h5>${ordre.description}</h5>
          <h6>#${ordre.quiz_id}</h6>
          </div>`;
        const url2 = `${state.serverUrl}/quizzes/${ordre.quiz_id}/questions/`;
        fetch(url2, { method: 'GET', headers: state.headers })
        .then(filterHttpResponse)
        .then((data2) => {
            let indice = 0
            let div = document.getElementById(ordre.quiz_id);
            ordre.questions_ids.map((question_id) => {
            div.innerHTML += `<hr/><p>${data2[indice].sentence}</p><hr/>`;
            data2[indice].propositions.map((contenu) => {
              if(contenu.proposition_id == data2[indice].correct_propositions_number)
                div.innerHTML += `<p class="teal-text text-lighten-2"><i class="material-icons">done</i>  ${contenu.content}</p>`;
              else
                div.innerHTML += `<p><i class="material-icons">chevron_right</i>  ${contenu.content}</p>`;
            });
            indice++;
          });
        });
        div_question.innerHTML += `<hr/><div>
        <button class="btn waves-effect waves-light purple lighten-2" type="button"
        name="action" onclick="ajoutFormQuestion(${ordre.quiz_id}, ${ordre.questions_number})" id="${ordre.quiz_id}-button"">
        Ajouter une question
        <i class="material-icons right">add</i>
        </button>
        </div>`;
      });
      div_question.innerHTML += "</div>";
    });
  }
  else
    div_question.innerHTML = "Veuillez vous connecter...";
}
