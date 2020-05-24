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
      state.answers = data;
      data.map((data2) => {
        div_reponse.innerHTML += `<div  id="${data2.quiz_id}"><h3>${data2.title}</h3><h5>${data2.description}</h5><div>`;
        const url2 = `${state.serverUrl}/quizzes/${data2.quiz_id}/questions/`;
        fetch(url2, { method: 'GET', headers: state.headers })
        .then(filterHttpResponse)
        .then((data3) => {
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
