import React from 'react'
import Header from './Header'
import { DocumentUpload } from './DocumentUpload'

const PageWrapper = () => {
  return (
     <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-foreground mb-8">Upload documents to sign</h1>
          <DocumentUpload/>
        </div>
      </main>
    </div>
  )
}

export default PageWrapper