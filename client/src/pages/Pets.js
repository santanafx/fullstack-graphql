import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import createPetModel from '../../../api/src/db/pet'
import Loader from '../components/Loader'
import NewPetModal from '../components/NewPetModal'
import PetsList from '../components/PetsList'


//se eu fizer uma mutation onde ja existe o mesmo node o apollo vai dar update automaticamente no cache.

//ou seja, abaixo tenho uma query que tem sua operacao chamada de AllPets. A query se chama pets. O node tem id,name,type e img

const ALL_PETS = gql`
query AllPets{
  pets{
  id
  name
  type
  img
  }
}
`

//a mutation abaixo tem, CreateAPet como nome da operacao. addPet com o nome da mutation e node tem id, name, type e img

const NEW_PET = gql`
mutation CreateAPet($newPet: NewPetInput!){
  addPet(input: $newPet){
      id
      name
      type
      img
    }
  }
`

//Se voce quiser atualizar somente o name de pet ainda sim 'e necessario passar id, name, type e img. Caso contrario apollo nao vai atualizar o cache automaticamente. A ordem de id,name,type e img nao importa

export default function Pets () {
  const [modal, setModal] = useState(false)
  const {data,loading,error} = useQuery(ALL_PETS)
  const [createAPet,newPet] = useMutation(NEW_PET, {
    update(cache, {data: {addPet}}) {
      const data = cache.readQuery({query: ALL_PETS})
      cache.writeQuery({
        query: ALL_PETS,
        data: {
          pets: [addPet, ...data.pets]
        }
      })
    }
  })

  if(loading){
    return <Loader />
  }

  if(error){
    return <p>error</p>
  }

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  const onSubmit = input => {
    setModal(false)
    createAPet({
      variables: {
        newPet: input
      }
    })
  }
  
  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets} />
      </section>
    </div>
  )
}
