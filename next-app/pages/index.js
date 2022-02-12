import React, {useEffect, useState} from "react";
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {
  addFakeUser,
  deleteFakeUser,
  getFakesers,
  getSpringProducts,
  getUser,
  getUsers,
} from "../requests";
import { ApolloProvider } from "@apollo/client";
import client from "../apollo_client";
import News from "../components/news";

const renderUser = (user) => {
  return (
      <>
        <p>id: {user.id}</p>
        <p>title: {user.title}</p>
        <p>completed: {user.completed.toString()}</p>
      </>
  );
}

const renderProduct = (product) => {
  return (
      <>
        <p>id: {product.id}</p>
        <p>content: {product.content}</p>
      </>
  );
}

export default function Home() {
  const [users, setUsers] = useState([]);
  const [fakeusers, setFakeusers] = useState([]);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [fakeIdInput, setFakeIdInput] = useState('');
  const [fakeTitleInput, setFakeTitleInput] = useState('');
  const [deletefakeIdInput, setDeletefakeIdInput] = useState('');
  const [springProducts, setSpringProducts] = useState([]);

  useEffect(async () => {
    handleGetSpringProducts();
    getFakeUsers();
    getUsers().then(resp => {
      if (resp.status === 200 && resp.data?.data?.getUsers) setUsers(resp.data.data.getUsers);
      else setUsers([]);
    })
  }, []);

  const handleGetSpringProducts = () => {
    getSpringProducts().then(resp => {
      if (resp.status === 200) setSpringProducts(resp.data.data.getAllProducts);
    })
  }

  const getFakeUsers = () => {
    getFakesers().then(resp => {
      if (resp.status === 200 && resp.data?.data?.getFakeUsers) setFakeusers(resp.data.data.getFakeUsers);
      else setFakeusers([]);
    });
  }

  const handleDeleteFakeButtonClick = () => {
    deleteFakeUser(deletefakeIdInput).then(resp => {
      if (resp.status === 200 && resp.data?.data?.deleteFakeUser) getFakeUsers();
    });
  }

  const handleFakeButtonClick = () => {
    addFakeUser(fakeIdInput, fakeTitleInput).then(resp => {
      if (resp.status === 200 && resp.data?.data?.addFakeUser) getFakeUsers();
    });
  }

  const setFakeIdInputValue = (e) => {
    setFakeIdInput(e.target.value);
  }

  const setFakeTitleInputValue = (e) => {
    setFakeTitleInput(e.target.value);
  }

  const setDeleteFakeIdInputValue = (e) => {
    setDeletefakeIdInput(e.target.value);
  }

  const handleButtonClick = () => {
    getUser(input).then(resp => {
      if (resp.status === 200 && resp.data?.data?.getUser) setUser(resp.data.data.getUser);
      else setUser();
    })
  }

  const setInputValue = (e) => {
    setInput(e.target.value);
  }

  return (
      <ApolloProvider client={client}>
        <div className={styles.container}>
          <Head>
            <title>{'next.js <- gql -> apollo server'}</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={styles.main}>

            Spring products:
            <p>{springProducts.map(renderProduct)}</p>

            Subscription news:
            <News />

            Fake users:
            <p>{fakeusers.length ? fakeusers.map(user => renderUser(user)) : ''}</p>

            Add a fake user:
            <input type='text' placeholder='Id' onChange={setFakeIdInputValue}/>
            <input type='text' placeholder='Title' onChange={setFakeTitleInputValue}/>
            <button onClick={handleFakeButtonClick}>Add</button>

            Delete a fake user:
            <input type='text' placeholder='Id' onChange={setDeleteFakeIdInputValue}/>
            <button onClick={handleDeleteFakeButtonClick}>Delete</button>

            First 3 users:
            <p>{users.length ? users.filter((u, i) => i <= 3).map(user => renderUser(user)) : ''}</p>

            Find user by id:
            <input type='text' onChange={setInputValue}/>
            <button onClick={handleButtonClick}>Find</button>
            Selected user:
            <p>{user ? renderUser(user) : ''}</p>
          </main>
        </div>
      </ApolloProvider>
  )
}
