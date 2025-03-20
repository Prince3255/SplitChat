import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from './user/userSlice'

// const removeSocketTransform = createTransform(
//     (inboundState) => {
//         const { socket, ...rest } = inboundState;
//         return rest
//     },
//     (outboundState) => outboundState,
//     {whiteList: ['user']}
// )

// {
//     ignorePaths: ['user.socket'],
//     ignoredActions: ['user/setSocket'],
// }

const rootReducer = combineReducers({
    user: userReducer
})

const persistConfig = {
    key: 'root',
    storage,
    version: 1,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
})

export const persistor = persistStore(store)