import './App.css';
import { useState, useEffect, useRef } from 'react';
import { createApi } from 'unsplash-js';
import { debounce } from 'lodash';
import {BounceLoader} from 'react-spinners';
import { API_KEY } from './api'

const unsplash = createApi({
  accessKey: API_KEY
});

function App() {

  const [phrase, setPhrase] = useState('');
  const phraseRef = useRef(phrase);
  const [images, setImages] = useState([]);
  const imagesRef = useRef(images);
  const [fetching, setFetching] = useState(false);
  const fetchingRef = useRef(fetching);

  function getUnsplashImages(query, page) {
    setFetching(true);
    fetchingRef.current = true;
    return new Promise((resolve, reject) => {
      unsplash.search.getPhotos({
        query,
        page,
        perPage: 5,
      }) .then(result=> {
        setFetching(false);
        fetchingRef.current = false;
        resolve(result.response.results.map(result => result.urls.regular));
      })
    });
  }

  useEffect(() => {
    phraseRef.current = phrase;
    if (phrase!== '') {
      debounce(() => {
        setImages([]);
        getUnsplashImages(phrase, 1)
          .then(images => {
            setImages(images);
            imagesRef.current = images;
          });
      }, 1000)();
    }
  }, [phrase]);

  function handleScroll(e) {
    const {scrollHeight, scrollTop, clientHeight} = e.target.scrollingElement;
    const isBottom = scrollHeight - scrollTop <= clientHeight;
    if (isBottom && !fetching) {
      getUnsplashImages(phraseRef.current, imagesRef.current.length / 5 + 1)
        .then(newImages => {
          imagesRef.current = [...imagesRef.current, ...newImages];
          setImages(imagesRef.current);
        })
    }
  }

  useEffect(() => {
    document.addEventListener('scroll', handleScroll, {passive: true})

    return () => document.removeEventListener('scroll', handleScroll);
  }, [])


  return (
    <div>
      <div className='search-box'>
        <input 
          type = "text" 
          value = {phrase} 
          onChange={e => setPhrase(e.target.value)}
        /><br />
      </div>
      
      {images.length > 0 && images.map(url => (
        <img src={url}/>
      ))}
      <div>
        {fetching && (
          <div style={{textAlign: 'center'}}>
            <div style={{display: 'inline-block'}}>
              <BounceLoader speedMultiplier={5} color={'#000000'}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
