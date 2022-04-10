import React, {useEffect, useState} from "react";
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {
    getGroupNames,
    getScrapeConfigs, getScreenshotsByGroup, modifyScrapeConfig,
    persistScrapeConfig, removeScrapeConfig, removeScreenshotByGroupAndUuid,
    scrape,
} from "../requests";
import {ApolloProvider} from "@apollo/client";
import apollo_client2 from "../apollo_client2";
import SpringServerHealthcheck from "../components/SpringServerHealthcheck";
import apollo_client from "../apollo_client";
import NodeServerHealthcheck from "../components/NodeServerHealthcheck";
import {createWrapperAndAppendToBody, ImageGallery} from "../components/ImageGallery";
import ReactDOM from "react-dom";
//TODO: authorization -> dashboard = config + results and handling 2x notifications

interface ScrapeConfig {
    id: number;
    host: string;
    path: string;
    jobAnchorSelector: string;
    jobLinkContains: string;
    numberOfPages: number;
    interval: number;
}

export default function Home() {
  const [id, setId] = useState('');
  const [host, setHost] = useState('');
  const [path, setPath] = useState('');
  const [jobAnchorSelector, setJobAnchorSelector] = useState('');
  const [jobLinkContains, setJobLinkContains] = useState('');
  const [numberOfPages, setNumberOfPages] = useState('');
  const [interval, setInterval] = useState('');
  const [configs, setConfigs] = useState([]);
  const [groupNames, setGroupNames] = useState([]);
  const [activeGroup, setActiveGroup] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [loadingScreenshots, setLoadingScreenshots] = useState(false);

  const portalId = 'gallery-portal-container';

  const renderConfigs = (configs: ScrapeConfig[]) =>
      configs.map((config, i) => (
          <div key={i} style={{marginBottom: '1rem'}}>
            <div>Id: {config.id}</div>
            <div>Host: {config.host}</div>
            <div>Path: {config.path}</div>
            <div>Job anchor selector: {config.jobAnchorSelector}</div>
            <div>Job link contains: {config.jobLinkContains}</div>
            <div>Number of pages: {config.numberOfPages}</div>
            <div>Interval [ms]: {config.interval}</div>
            <button onClick={() => handleDelete(config.id)}>Delete config at Spring</button>
          </div>
      ));

  const renderScreenshotsGroups = (groupNames: string[]) =>
      groupNames.map((group, i) =>
          <button key={i} onClick={() => handleGroupChange(group)}>{group}</button>
      );

  const handleGroupChange = (group: string) => {
      setLoadingScreenshots(true);
      getScreenshotsByGroup(group).then(resp => {
          if (resp.status === 200 && resp.data.data && resp.data.data.getScreenshotsByGroup && resp.data.data.getScreenshotsByGroup.files && resp.data.data.getScreenshotsByGroup.files.length) {
              setScreenshots(resp.data.data.getScreenshotsByGroup.files);
              setActiveGroup(group);
              setLoadingScreenshots(false);
          }
      });
  }

    const removeScreenshot = (uuid: string) => {
      removeScreenshotByGroupAndUuid(activeGroup, uuid);
    }

    useEffect(() => {
        if (activeGroup) {
            const portalWrapper = document.getElementById(portalId);
            if (!portalWrapper) createWrapperAndAppendToBody(portalId);
        }
    }, [activeGroup]);

  useEffect(() => {
    getScrapeConfigs().then(resp => {
      if (resp.status === 200 && resp.data.data && resp.data.data.getPages && resp.data.data.getPages.length)
          setConfigs(resp.data.data.getPages);
    });
    getGroupNames().then(resp => {
        if (resp.status === 200 && resp.data.data && resp.data.data.getGroupNames.names && resp.data.data.getGroupNames.names)
            setGroupNames(resp.data.data.getGroupNames.names);
    });
  }, []);

  const handleScrape = () => {
    scrape(host, path, jobAnchorSelector, jobLinkContains, parseInt(numberOfPages)).then(resp => {
      if (resp.status === 200 && resp.data.data && resp.data.data.scrape && resp.data.data.scrape.complete) alert('done!');
    }).catch(e => console.log(e));
  }

  const handleAdd = () => {
    persistScrapeConfig(host, path, jobAnchorSelector, jobLinkContains, parseInt(numberOfPages), parseInt(interval)).then(resp => {
      if (resp.status === 200 && resp.data.data && resp.data.data.addPage) alert('done!');
    }).catch(e => console.log(e));
  }

  const handleDelete = (id: number) => {
    removeScrapeConfig(id).then(resp => {
      if (resp.status === 200 && resp.data.data && resp.data.data.addPage) alert('done!');
    }).catch(e => console.log(e));
  }

  const handleModify = () => {
    modifyScrapeConfig(parseInt(id), host, path, jobAnchorSelector, jobLinkContains, parseInt(numberOfPages), parseInt(interval)).then(resp => {
        if (resp.status === 200 && resp.data.data && resp.data.data.modifyPage) alert('done!');
    }).catch(e => console.log(e));
  }

  return (
      <div className={styles.container}>
        <Head>
          <title>{'next.js <- gql -> apollo server'}</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>

          Scrapes performed at:
          <ApolloProvider client={apollo_client2}>
            <SpringServerHealthcheck />
          </ApolloProvider>

          New jobs found:
          <ApolloProvider client={apollo_client}>
            <NodeServerHealthcheck />
          </ApolloProvider>

          <h2>Add/edit config:</h2>
          Id: <input type={'text'} onChange={e => setId(e.target.value)}/>
          Host: <input type={'text'} onChange={e => setHost(e.target.value)}/>
          Path: <input type={'text'} onChange={e => setPath(e.target.value)}/>
          Job anchor selector: <input type={'text'} onChange={e => setJobAnchorSelector(e.target.value)}/><br/>
          Job link contains: <input type={'text'} onChange={e => setJobLinkContains(e.target.value)}/>
          Number of pages: <input type={'text'} onChange={e => setNumberOfPages(e.target.value)}/>
          Interval [ms]: <input type={'text'} onChange={e => setInterval(e.target.value)}/><br/>
          <button onClick={handleScrape}>Scrape with Node</button>
          <button onClick={handleAdd}>Add config at Spring</button>
          <button onClick={handleModify}>Modify config at Spring</button>

          <h2>Configs:</h2>
          {renderConfigs(configs)}

          <h2>Screenshots:</h2>
          {renderScreenshotsGroups(groupNames)}

          <br/>
          <br/>
            {loadingScreenshots ? <span>Loading...</span> : process.browser && document.getElementById(portalId) && ReactDOM.createPortal(
                <ImageGallery
                    images={screenshots.map(screenshot => ({
                        src: `http://localhost:8080/screenshots/${activeGroup}/${screenshot}.png`,
                        onDelete: () => removeScreenshot(screenshot)
                    }))}
                    disactive={() => {
                        setActiveGroup('')
                        setScreenshots([]);
                    }}
                />,
                document.getElementById(portalId)
            )}

        </main>
      </div>
  )
}
