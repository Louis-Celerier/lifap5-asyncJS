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
      console.log(data);
      data.map((quizz) => {
        quizz.title = quizz.type;
        quizz.description = quizz.text;
        quizz.owner_id = `rang : ${quizz.rank}`;
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
