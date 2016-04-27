var CinemalyticsKey = "36F81B282A8350325875E15C19771A04";

// MovieEngine Component
var MovieEngine = React.createClass({
  getInitialState: function() {
    return {
      movies: [],
      currentMovie: {},
      movieModalActive: false
    }
  },
  setMovies: function(newMovies) {
    this.setState({movies: newMovies});
  },
  setCurrentMovie: function(event) {
    var self = this;
    $.ajax("https://api.cinemalytics.com/v1/movie/id/"+ event.target.getAttribute("data-key") +"/?auth_token="+CinemalyticsKey)
    .done(function(data) {
      self.setState({currentMovie: data, movieModalActive: true});
    });
  },
  closeModal: function(event) {
    this.setState({currentMovie: {}, movieModalActive: false})
  },
  render: function () {
    return(
      <div>
        <InputBox setMovies= { this.setMovies } />
        <MovieList setCurrentMovie={ this.setCurrentMovie } movies={ this.state.movies } />
        <MovieModal currentMovie= { this.state.currentMovie } closeModal={ this.closeModal } movieModalActive={ this.state.movieModalActive } />
      </div>
    )
  }
})

// InputBox Component
var InputBox = React.createClass({
  getInitialState: function () {
    return {
      suggestions : []
    }
  },
  getSuggestions: function (event) {
    var self = this;
    var newSuggestions = [];

    if(!event.target.value){ self.setState({suggestions: []}); return }
    
    $.ajax("https://api.cinemalytics.com/v1/director/name/"+ event.target.value +"/?auth_token="+CinemalyticsKey)
    .done(function (data) {
      newSuggestions = data.slice(0,10).map(function (director) {
        return {key: director.Id, name: director.Name}
      });
      self.setState({suggestions: newSuggestions});
    });

  },
  clearsuggestions: function() {
    this.setState({suggestions: []});
  },
  render: function () {
    return (
      <form id="dirInput" action="#">
        <input type="text" onChange={ this.getSuggestions } name="search_key" data-id="" placeholder="Director name..." />
        <DirList setMovies = {this.props.setMovies} clearsuggestions={ this.clearsuggestions } suggestions={this.state.suggestions} />
      </form>
    )
  }
});

// DirList
var DirList = React.createClass({
  getInitialState: function () {
    return {}  
  },
  selectDir: function (event) {
    var self = this;
    var selectedDirectorName = event.target.getAttribute("data-name");
    if(!event.target.getAttribute("data-key")){ return };
    $.ajax("https://api.cinemalytics.com/v1/director/"+ event.target.getAttribute("data-key") +"/movies/?limit=5&auth_token="+CinemalyticsKey)
    .done(function (data) {
      if(data){
        $("input[name='search_key']").val(selectedDirectorName);
        self.props.clearsuggestions();
        self.props.setMovies(data.slice(0,10));
      }else{
        self.props.clearsuggestions();
        self.props.setMovies([]);
      }
    });
  },
  render: function () {
    var self = this;
    var suggestionNodes = this.props.suggestions.map(function (suggestion) {
      return ( <li onClick={ self.selectDir } key={ suggestion.key } data-name={ suggestion.name } data-key={ suggestion.key } >{ suggestion.name }</li> );
    });

    return (
      <ul>
        { suggestionNodes }
      </ul>
    )
  }
});

var MovieList = React.createClass({
  ratingNode: function (rating) {
    var ratingElement = [];
    for (var i = 1; i < rating; i++) {
      ratingElement.push(<i key={ Date.now()+Math.random() } className="star icon"></i>);
    }
    var ratingFraction = rating - Math.floor(rating);
    if(ratingFraction > 0.5 && ratingFraction < 0.76){
      ratingElement.push(<i key={ Date.now()+Math.random() } className="star half icon"></i>);
    }else if(ratingFraction >= 0.76){
      ratingElement.push(<i key={ Date.now()+Math.random() } className="star icon"></i>);
    }else if(ratingFraction < 0.5){
      // No more stars
    }

    return(ratingElement)
  },
  render: function() {
    var self = this;
    var movieNodes = this.props.movies.map(function(movie) {
      var rating = parseFloat(movie.Rating);

      return (
        <div key={ movie.Id } data-key={ movie.Id } class="movieItem">
          <img src={ movie.PosterPath } alt="" />
          <div className="details">
            <h1  data-key={ movie.Id } onClick={ self.props.setCurrentMovie } class="title"> { movie.Title } </h1>
            <span class="year">({ movie.ReleaseDate.substr(movie.ReleaseDate.lastIndexOf("/")+1, 4) })</span>
            <br />
            { self.ratingNode(rating) }
          </div>
        </div>
      );
    })
    return (
      <div id="movieList">
        { movieNodes }
      </div>
    );
  }
});

// MovieModal Component
var MovieModal = React.createClass({
  ratingNode: function (rating) {
    var ratingElement = [];
    for (var i = 1; i < rating; i++) {
      ratingElement.push(<i key={ Date.now()+Math.random() } className="star icon"></i>);
    }
    var ratingFraction = rating - Math.floor(rating);
    if(ratingFraction > 0.5 && ratingFraction < 0.76){
      ratingElement.push(<i key={ Date.now()+Math.random() } className="star half icon"></i>);
    }else if(ratingFraction >= 0.76){
      ratingElement.push(<i key={ Date.now()+Math.random() } className="star icon"></i>);
    }else if(ratingFraction < 0.5){
      // No more stars
    }

    return(ratingElement)
  },
  render: function() {
    var self = this;
    var rating = this.props.currentMovie.Rating;
    return (
      <div id="movieModal" data-show={ this.props.movieModalActive ? "show" : "" } >
        <button onClick={ this.props.closeModal } className="close" > <i className="icon remove" ></i> </button>
        <h1 className="title">{ this.props.currentMovie.Title }</h1>
        <span className="release">
        { this.props.currentMovie.ReleaseDate ? this.props.currentMovie.ReleaseDate.substr(this.props.currentMovie.ReleaseDate.lastIndexOf("/")+1, 4) : "" }
        </span>
        <br />
        <span className="genre">{ this.props.currentMovie.Genre ? "Genre: "+ this.props.currentMovie.Genre : "" }</span>
        <br />
        <span className="runtime">{ this.props.currentMovie.Runtime ? this.props.currentMovie.Runtime+" minutes" : ""}</span>
        <div className="posterContainer" >
          <img src={ this.props.currentMovie.PosterPath } alt="" className="poster" />
        </div>
        <span className="director_name"></span>
        <span className="rating">
        { self.ratingNode(rating) }
        </span>
        <br />
        <span className="budget">{(this.props.currentMovie.Budget > 0 ) ? "Budget: Rs. " + this.props.currentMovie.Budget : ""  }</span>
        <br />
        <span className="revenue">{(this.props.currentMovie.Revenue > 0 ) ? "Revenue: Rs. " + this.props.currentMovie.Revenue : ""  }</span>
        <br />
        <p className="description">
          { this.props.currentMovie.Description }
        </p>
      </div>
    )
  }
})

ReactDOM.render(
  <MovieEngine />,
  document.getElementById('mainContainer')
);