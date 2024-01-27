/* eslint-disable react-hooks/exhaustive-deps */
import React,{useEffect,useState,useContext} from 'react'
import Base from './Base'
import {Table,Col,Row,Button} from "reactstrap"
import {getMyBorrowPosts, editBorrowPost} from '../services/user-service';
import { useParams,useNavigate } from 'react-router-dom';
import userContext from '../context/userContext';
import {toast} from 'react-toastify';
const MyBorrowPosts=()=> {
    const object=useContext(userContext);
    const [posts,setPosts]=useState();
    const {eEmail}=useParams();
    const navigate=useNavigate();
  
  useEffect(()=>{
    getMyBorrowPosts(eEmail).then((response)=>{
        console.log(response);
      setPosts(response);
    }).catch((error)=>{
      console.log(error);
    })
  },[eEmail]);

  
  return (
  <Base>
   <Row className="m-4">
        <Col >
        <h2 className="mb-4">My Books For Lend</h2>
        <Table responsive striped bordered={false} className="text-justify-center">
            <thead>
                <tr className='text-center'>
                    <th>ID No</th>
                    <th>Book Title</th>
                    <th>Author of Book</th>
                    <th>Edition of Book</th>
                    <th>Number of Pages</th>
                    <th>Rent Period</th>
                    <th>Pick Up Point</th>
                    <th>Rental Fee</th>
                    <th>Category</th>
                    <th>State</th>
                    <th>Edit Post</th>
                   
                </tr>
            </thead>
            {posts?(
            <tbody>            {posts.map((book) => (
               <tr key={book.borrId} className='text-center'> 
                        <td>{book.borrId}</td>
                        <td>{book.b_title}</td>
                        <td>{book.b_authorname}</td>
                        <td>{book.b_edition}</td>
                        <td>{book.b_numOfPages}</td>
                        <td>{book.returnTime}</td>
                        <td>{book.pickupPoint}</td>
                        <td>{book.paymentForBorrow}</td>
                        <td>{book.category}</td>
                        <td>{(book.b_quantity>0)?"Available":"Unavailable"}</td>
                        <td>{(book.b_quantity>0)?<Button color='primary' href={`/user/edit-borrow-post/${book.borrId}`}>Edit</Button>:<Button color='secondary' disabled>Edit</Button>}</td>
                    </tr>
                    ))}
                    </tbody>):
                    <>
                    <h3>No requests found...</h3>
                    </>
            }
        </Table>
   </Col>
   </Row>
    </Base>
  )
}

export default MyBorrowPosts;