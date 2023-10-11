import React from 'react'
import styles from './notFound.module.scss'
import Layout from '../layout'

export const NotFound: React.FC = () => {
  return (
    <Layout {...{
      title: 'HomeTrainers.net | Not Found',
      description: 'The requested page was not found'
    }}>
      <div className={styles.notFound}>
        <h1>Sorry, the page you were looking for was not found</h1>
      </div>
    </Layout>
  )
}