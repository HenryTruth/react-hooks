import React, {useReducer, useCallback, useEffect, useMemo  } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

const IngredientReducer = (currentIngredients, action) => {
  switch(action.type){
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient]
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id)
    default:
      throw new Error('Should not get there!');
  }
}


const httpReducer = (curHttpState, action) => {
  switch(action.type){
    case 'SEND':
      return {loading:true, error:null};
    case 'RESPONSE':
      return {...curHttpState, loading:false};
    case 'ERROR':
      return {loading: false, error:action.errorMessage}
    case 'CLEAR':
      return {...curHttpState, error:null};
      default:
        throw new Error('should not be reached')
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(IngredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading:false, error:null})
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsloading] = useState(false)
  // const [error, setError] = useState();

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  },[userIngredients])

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({type: 'SET', ingredients:filteredIngredients});
  }, [])

  const addIngredientHandler = ingredient => {
    dispatchHttp({type:'SEND'})
    fetch('https://react-hooks-update-9a45d-default-rtdb.firebaseio.com/ingredients.json', {
      method:'POST',
      body:JSON.stringify(ingredient),
      headers:{'Content-Type':'application/json'}
    }).then( response => {
      dispatchHttp({type:'RESPONSE'})
      return response.json()
    }).then(responseData => {
      // setUserIngredients(prevIngredients => 
      //   [...prevIngredients,
      //   {id:responseData.name, ...ingredient}])
      dispatch({type:'ADD', ingredient:{id:responseData.name, ...ingredient}})
    });
    
  };

  const removeIngredientHandler = useCallback(ingredientId => {
    dispatchHttp({type:'SEND'})
    fetch(`https://react-hooks-update-9a45d-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`, {
      method:'DELETE',
    }).then(response => {
      dispatchHttp({type:'RESPONSE'})
      dispatch({type:'DELETE', id:ingredientId})
      // setUserIngredients(prevIngredients => prevIngredients.filter(ingredient => ingredient.id !== ingredientId))
    }).catch( error => {
      dispatchHttp({type:'ERROR', errorMessage:'Something went wrong'})
    })
  }, [])

  const clearError = useCallback(() => {
    dispatchHttp({type:'CLEAR'})
  }, [])

  const ingredientList = useMemo(() => {
    return(
      <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
    )
  }, [userIngredients, removeIngredientHandler])
  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} loading={httpState.loading} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
