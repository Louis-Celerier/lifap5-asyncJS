/* global state getQuizzes */

// //////////////////////////////////////////////////////////////////////////////
// HTML : fonctions génération de HTML à partir des données passées en paramètre
// //////////////////////////////////////////////////////////////////////////////

// génération d'une liste de quizzes avec deux boutons en bas
const htmlQuizzesList = (quizzes, curr, total) => {
  console.debug(`@htmlQuizzesList(.., ${curr}, ${total})`);

  // un élement <li></li> pour chaque quizz. Noter qu'on fixe une donnée
  // data-quizzid qui sera accessible en JS via element.dataset.quizzid.
  // On définit aussi .modal-trigger et data-target="id-modal-quizz-menu"
  // pour qu'une fenêtre modale soit affichée quand on clique dessus
  // VOIR https://materializecss.com/modals.html
  const quizzesLIst = quizzes.map(
    (q) =>
      `<li class="collection-item modal-trigger cyan lighten-5" data-target="id-modal-quizz-menu" data-quizzid="${q.quiz_id}">
        <h5>${q.title}</h5>
        ${q.description} <a class="chip">${q.owner_id}</a>
      </li>`
  );

  // le bouton "<" pour revenir à la page précédente, ou rien si c'est la première page
  // on fixe une donnée data-page pour savoir où aller via JS via element.dataset.page
  const prevBtn =
    curr !== 1
      ? `<button id="id-prev-quizzes" data-page="${curr -
          1}" class="btn"><i class="material-icons">navigate_before</i></button>`
      : '';

  // le bouton ">" pour aller à la page suivante, ou rien si c'est la première page
  const nextBtn =
    curr !== total
      ? `<button id="id-next-quizzes" data-page="${curr +
          1}" class="btn"><i class="material-icons">navigate_next</i></button>`
      : '';

  // La liste complète et les deux boutons en bas
  const html = `
  <ul class="collection">
    ${quizzesLIst.join('')}
  </ul>
  <div class="row">
    <div class="col s6 left-align">${prevBtn}</div>
    <div class="col s6 right-align">${nextBtn}</div>
  </div>
  `;
  return html;
};

// //////////////////////////////////////////////////////////////////////////////
// RENDUS : mise en place du HTML dans le DOM et association des événemets
// //////////////////////////////////////////////////////////////////////////////

// met la liste HTML dans le DOM et associe les handlers aux événements
// eslint-disable-next-line no-unused-vars
function renderQuizzes() {
  console.debug(`@renderQuizzes()`);

  // les éléments à mettre à jour : le conteneur pour la liste des quizz
  const usersElt = document.getElementById('id-all-quizzes-list');
  // une fenêtre modale définie dans le HTML
  const modal = document.getElementById('id-modal-quizz-menu');

  // on appelle la fonction de généraion et on met le HTML produit dans le DOM
  usersElt.innerHTML = htmlQuizzesList(
    state.quizzes.results,
    state.quizzes.currentPage,
    state.quizzes.nbPages
  );

  // /!\ il faut que l'affectation usersElt.innerHTML = ... ait eu lieu pour
  // /!\ que prevBtn, nextBtn et quizzes en soient pas null
  // les éléments à mettre à jour : les boutons
  const prevBtn = document.getElementById('id-prev-quizzes');
  const nextBtn = document.getElementById('id-next-quizzes');
  // la liste de tous les quizzes individuels
  const quizzes = document.querySelectorAll('#id-all-quizzes-list li');

  // les handlers quand on clique sur "<" ou ">"
  function clickBtnPager() {
    // remet à jour les données de state en demandant la page
    // identifiée dans l'attribut data-page
    // noter ici le 'this' QUI FAIT AUTOMATIQUEMENT REFERENCE
    // A L'ELEMENT AUQUEL ON ATTACHE CE HANDLER
    getQuizzes(this.dataset.page);
  }
  if (prevBtn) prevBtn.onclick = clickBtnPager;
  if (nextBtn) nextBtn.onclick = clickBtnPager;

  // qd on clique sur un quizz, on change sont contenu avant affichage
  // l'affichage sera automatiquement déclenché par materializecss car on
  // a définit .modal-trigger et data-target="id-modal-quizz-menu" dans le HTML
  function clickQuiz() {
    const quizzId = this.dataset.quizzid;
    console.debug(`@clickQuiz(${quizzId})`);
    const addr = `${state.serverUrl}/quizzes/${quizzId}`;
    const html = `
      <p>Vous pourriez aller voir <a href="${addr}">${addr}</a>
      ou <a href="${addr}/questions">${addr}/questions</a> pour ses questions<p>.`;
    modal.children[0].innerHTML = html;
    state.currentQuizz = quizzId;
    // eslint-disable-next-line no-use-before-define
    renderCurrentQuizz();
  }

  // pour chaque quizz, on lui associe son handler
  quizzes.forEach((q) => {
    q.onclick = clickQuiz;
  });

  //Mes Réponses et Mes Quizz
  let attente = () => new Promise((success, failure) => {
    setTimeout(success(), 800);
  });
  const render = attente();
  render.then(() => {
    renderMyQuizzes();
    renderMyAnswer();
  })
}

function renderCurrentQuizz() {
  const main = document.getElementById('id-all-quizzes-main');
  if(state.user) {// L'utilisateur est connecté
    let id;
    for (id = 0; id < state.quizzes.results.length; id++) // On cherche la position du quizz actuel dans le tableau
      if(state.currentQuizz == state.quizzes.results[id].quiz_id) break;
    const url = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions`;
    fetch(url, { method: 'GET', headers: state.headers }) // Demande du quizz
    .then(filterHttpResponse)
    .then((data) => {
      if(state.myQuizzes.some((quiz) => quiz.quiz_id == state.currentQuizz)) {// Si le quizz appartient à l'utilisateur
        state.myQuizzes.filter((quiz) => quiz.quiz_id == state.currentQuizz)
        .map((ordre) => {
          if(ordre.open)
            main.innerHTML = `<div id=${ordre.quiz_id}>
            <h3 class="teal-text text-lighten-2">${ordre.title}</h3>
            <h5>${ordre.description}</h5>
            <h6>#${ordre.quiz_id}</h6>
            </div>`;
          else
            main.innerHTML = `<div id=${ordre.quiz_id}>
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
          main.innerHTML += `<hr/><div>
          <button class="btn waves-effect waves-light purple lighten-2" type="button"
          name="action" onclick="ajoutFormQuestion(${ordre.quiz_id}, ${ordre.questions_number})" id="${ordre.quiz_id}-button"">
          Ajouter une question
          <i class="material-icons right">add</i>
          </button>
          </div>`;
        });
      }
      else {
        main.innerHTML = `<h3>Quizz #${state.currentQuizz} : ${state.quizzes.results[id].title}</h3><h5>${state.quizzes.results[id].description}</h5>`;
        if(state.quizzes.results[id].open) {
          main.innerHTML += `<form id="rep_quest" action="#!">`;
          if(state.answers.some((quiz) => quiz.quiz_id == data[0].quiz_id)) {// Si l'utilisateur à deja repondu au quizz
            let reponses = state.answers.filter((quiz) => quiz.quiz_id == data[0].quiz_id)[0].answers;
            data.map((question) => {// On coche ce qu'il avait déjà choisie
              let reponse = reponses.filter((rep) => rep.question_id == question.question_id);
              main.innerHTML += `<hr/><p>${question.sentence}</p><hr/>`;
              question.propositions.map((proposition) =>{
                let p_id = reponse.some((p_Id) => p_Id.proposition_id == proposition.proposition_id) ? "checked" : "";
                main.innerHTML += `<p>
                <label>
                <input name="${question.question_id}" value="${proposition.proposition_id}" onclick="envoi(${question.question_id}, ${proposition.proposition_id})" type="radio" ${p_id}/>
                <span>${proposition.content}</span>
                </label>
                </p>`;
              });
            });
          }
          else {
            data.map((question) => {// Affichage par défaut d'un quizz valide
              main.innerHTML += `<hr/><p>${question.sentence}</p><hr/>`;
              question.propositions.map((proposition) =>{
                main.innerHTML += `<p>
                <label>
                <input name="${question.question_id}" value="${proposition.proposition_id}" onclick="envoi(${question.question_id}, ${proposition.proposition_id})" type="radio"/>
                <span>${proposition.content}</span>
                </label>
                </p>`;
              });
            });
          }
        }
        else
          data.map(c => {// Affichage d'un quizz non valide
            main.innerHTML += `<hr/><p>${c.sentence}</p><hr/>`;
            c.propositions.map((proposition) =>{
              main.innerHTML += `<p>
              <label>
              <input type="radio" disabled="disabled"/>
              <span>${proposition.content}</span>
              </label>
              </p>`;
            });
          });
      }
    });
  }
  else
    main.innerHTML = `<h5>Veuillez-vous connecter...</h5>`;
}

// quand on clique sur le bouton de login, il nous dit qui on est
// eslint-disable-next-line no-unused-vars
const renderUserBtn = () => {
  const btn = document.getElementById('id-login');
  btn.onclick = () => {
    if (state.user) {
      // eslint-disable-next-line no-alert
      if(confirm(`Bonjour ${state.user.firstname} ${state.user.lastname.toUpperCase()}, souhaitez-vous vous déconnectez ?`)) {
        state.xApiKey = undefined;
        headers.set('X-API-KEY', state.xApiKey);
        app();
      }
    } else {
      // eslint-disable-next-line no-alert
      //alert(`Pour vous authentifier, remplir le champs xApiKey de l'objet state dans js/modele.js`);

      state.xApiKey = prompt("Veuillez saisir votre xApiKey :");
      headers.set('X-API-KEY', state.xApiKey);
      app();
    }
  };
};

let envoi = (question_id, proposition_id) => {
  console.debug(`@envoi(${question_id}, ${proposition_id})`);
  let ok = false;
  const url = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions/${question_id}/answers/${proposition_id}`;
  fetch(url, { method: 'POST', headers: state.headers })
  .then(filterHttpResponse2)
  .then((data) => {
    console.log(`Question #${question_id} Reponse #${proposition_id} : Envoyer`);
    ok = true;
  })
  .catch((err) => {
    console.error(`Error on json: ${err}`);
    ok = false;
  });
  let etat = () => new Promise((success, failure) => {
    setTimeout(() => {
      if(ok)
        success();
      else
        failure();
    }, 1000);
  });
  const message = etat();
  message.then(renderMyAnswer)
  .catch(() => M.toast({html: `Il y a eu une erreur, le serveur à rejeter votre envoi`}));
}
