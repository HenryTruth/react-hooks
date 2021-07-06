import React, {useReducer, useCallback, useEffect, useMemo  } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

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




const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(IngredientReducer, []);
  const {isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear } = useHttp();

  useEffect(() => {
    if(!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT'){
      dispatch({type:'DELETE', id:reqExtra})
    }else if(!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT'){
        dispatch({type:'ADD', ingredient:{id:data.name, ...reqExtra}
      })
    }
    
  },[data, reqExtra, reqIdentifier, isLoading, error])

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({type: 'SET', ingredients:filteredIngredients});
  }, [])

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest('https://react-hooks-update-9a45d-default-rtdb.firebaseio.com/ingredients.json', 'POST', JSON.stringify(ingredient),ingredient, 'ADD_INGREDIENT')
    
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(ingredientId => {
    sendRequest(`https://react-hooks-update-9a45d-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`, 
    'DELETE',
    null,
    ingredientId,
    'REMOVE_INGREDIENT'
    )
    
  }, [sendRequest])

  // const clearError = useCallback(() => {
  //   dispatchHttp({type:'CLEAR'})
  // }, [])

  const ingredientList = useMemo(() => {
    return(
      <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
    )
  }, [userIngredients, removeIngredientHandler])
  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} loading={isLoading} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
