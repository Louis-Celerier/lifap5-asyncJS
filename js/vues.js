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
  renderMyQuizzes();
  renderMyAnswer();
}

function renderCurrentQuizz() {
  const main = document.getElementById('id-all-quizzes-main');
  if(state.user) {
    let id;
    for (id = 0; id < state.quizzes.results.length; id++)
      if(state.currentQuizz == state.quizzes.results[id].quiz_id) break;
    const url = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions`;
    fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then((data) => {
      main.innerHTML = `<h3>Quizz #${state.currentQuizz} : ${state.quizzes.results[id].title}</h3><h5>${state.quizzes.results[id].description}</h5>`;
      if(state.quizzes.results[id].open) {
        main.innerHTML += `<form id="rep_quest" action="#!">`;
        data.map((question) => {
          main.innerHTML += `<hr/><p>${question.sentence}</p><hr/>`;
          question.propositions.map((proposition) =>{
            main.innerHTML += `<p>
              <label>
              <input name="${question.question_id}" value="${proposition.proposition_id}" type="radio" checked/>
              <span>${proposition.content}</span>
              </label>
              </p>`;
            });
        });
        main.innerHTML += `<button class="btn waves-effect waves-light" type="submit" name="action" id="Repondre">Répondre
          <i class="material-icons right">send</i>
          </button>
          </form>`;
        let envoi = document.getElementById('Repondre');
        envoi.onclick = () => {
          let ok = false;
          data.map((question) => {
              const name = document.getElementsByName(question.question_id);
              name.forEach((reponse) =>{
                if(reponse.checked) {
                  const url2 = `${state.serverUrl}/quizzes/${state.currentQuizz}/questions/${question.question_id}/answers/${reponse.value}`;
                  fetch(url2, { method: 'POST', headers: state.headers })
                  .then(filterHttpResponse2)
                  .then((data) => {
                    console.log(`Question #${question.question_id} Reponse #${reponse.value} : Envoyer`);
                    ok = true;
                  })
                  .catch((err) => {
                    console.error(`Error on json: ${err}`);
                    ok = false;
                  });
                }
              });
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
          message.then(() => {
            renderMyAnswer();
            alert(`Les reponses ont été envoyée avec succès`);
          })
          .catch(() => alert(`Il y a eu une erreur, le serveur à rejeter votre envoi`));
        };
      }
      else
        data.map(c => {
          main.innerHTML += `<hr/><p>${c.sentence}</p><hr/>`;
          c.propositions.map((proposition) =>{
            main.innerHTML += `<p>
              <label>
              <input type="radio" disabled="disabled"/>
              <span>${proposition.content}</span>
              </label>
              </p>`;
          });
          main.innerHTML += `<a class="btn disabled">Répondre
            <i class="material-icons right">send</i>
            </a>`;
        });
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
