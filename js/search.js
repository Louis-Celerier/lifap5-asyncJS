/* search */

// //////////////////////////////////////////////////////////////////////////////
// Fichier contenant le code de la barre de recherche
// //////////////////////////////////////////////////////////////////////////////

let search = document.getElementById('search');

search.onchange = () => {// Fonction de recherche sur le serveur de la barre de recherche
  console.debug(`@search : ${search.value}`);
  if(search.value != "") {
    const url = `${state.serverUrl}/search/?q=${search.value}`;
    fetch(url, { method: 'GET', headers: state.headers })
    .then(filterHttpResponse)
    .then(data => {
      data.map((quizz) => reponse = {
        title: quizz.type,
        description: quizz.text,
        rang: `rang : ${quizz.rank}`
      });
      state.quizzes.results = data;
      state.quizzes.currentPage = 1;
      state.quizzes.nbPages = 1;
      renderQuizzes();
      });
    }
    else
      getQuizzes();
}
