import { Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Textfield from '../formUI/Textfield';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser, setIsAuthenticated } from '../../redux/appSlice';


import "./Profile.css"

export default function Profile() {

  const user = useSelector(state => state.app.authUser);
  const [submitloader, setSubmitLoader] = useState(false)
  
  const INITIAL_FORM_STATE = {
    name:"",
    email:"",
    username:"",
    college:"",
    whatsappNumber:"",
    githubUsername:""
  }

  if(user && !INITIAL_FORM_STATE.name){
    INITIAL_FORM_STATE.name = user.fullName;
    INITIAL_FORM_STATE.email = user.email;
    if(user.username){
      INITIAL_FORM_STATE.username = user.username;
    }
    if(user.whatsappNumber){
      INITIAL_FORM_STATE.whatsappNumber = user.whatsappNumber;
    }
    if(user.college){
      INITIAL_FORM_STATE.college = user.college;
    }
    if(user.githubUsername){
      INITIAL_FORM_STATE.githubUsername = user.githubUsername;
    }
  }

 

  const checkAvailabilityUsername = async (username) =>{
    const getUser = await axios.get(`/api/getuser/${username}`).catch(err=>console.log("Error checking username",err))
    if(getUser){
      if(getUser.data.message==="user not exist"){
        return true;
      }
      else{
        return false;
      }
    }
  }

  const regexUsername = /^(?=.{4,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
  const regexUserNameTest1 = /^(?![_.])$/
  const regexUserNameTest2 = /^(?!.*[_.]{2})$/
  const regexUserNameTest3 = /^[a-zA-Z0-9._]$/
  const regexUserNameTest4 = /^(?<![_.])$/

  const FORM_VALIDATION = Yup.object().shape({
    username:  Yup.string()
    .min(4, "Mininum 4 characters")
    .max(15, "Maximum 15 characters")
    .matches(regexUserNameTest1,'Username should not start with _ or .')
    .matches(regexUserNameTest2,'Username should not have __ or _. or ._ or .. in between')
    .matches(regexUserNameTest3,'Only letters, numbers and symbols .and _ are allowed')
    .matches(regexUserNameTest4,'No _ or  . at the end')
    .test("username", "This username has already been taken", function (username) {
            if(user.username){
              return true;
            }
            return checkAvailabilityUsername(username);
    })
    .required("You must enter a username"),
    college: Yup.string()
      .required('Required'),
    whatsappNumber: Yup.number()
    .integer()   
    .typeError('Please eneter a valid phone number')
    .test(('len', 'Must be exactly 10 characters', val => !val ||val.toString().length === 10 ))  //phone number not exist or is equal to 10
  })


  const navigate = useNavigate();

  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [username, setUsername] = useState("");
  // const [college, setCollege] = useState("");
  // const [whatsappNumber, setWhatsappNumber] = useState("");
  // const [githubUsername, setGithubUsername] = useState("");

  // if (user && name == "") {
  //   // setName(user.fullName);
  //   // setEmail(user.email);
  //   // if (user.isRegistered) {
  //   //   setUsername(user.username);
  //   // }
  //   // if (user.college) {
  //   //   setCollege(user.college);
  //   // }
  //   // if (user.whatsappNumber) {
  //   //   setCollege(user.whatsappNumber);
  //   // }
  //   // if (user.githubUsername) {
    //   //   setCollege(user.githubUsername);
    //   // }
    //   console.log(user.fullName);
    //   INITIAL_FORM_STATE.name = user.fullName;
    // }
    
  const dispatch = useDispatch();
  const handleSubmit = async (values) => {

    // if(user.college===""){
    //   setCollege(null);
    // }
    // if(user.whatsappNumber===""){
    //   setWhatsappNumber(null);
    // }
    // if(user.githubUsername===""){
    //   setGithubUsername(null);
    // }

    setSubmitLoader(true);

    const googleId = user.googleId;


    const response = await axios.patch("/api/updateprofile", { ...values, googleId }, { withCredentials: true }).catch((err) => {
      console.log("Error while updating", err);
    })
    if (response && response.data) {
      if(response.data.message=="Record Updated"){
        console.log("Record Updated Successfully");
      }
    }
    const userData = await axios.get("/api/auth/user", { withCredentials: true }).catch((err) => {
      console.log("Not properly authenticated", err);
      dispatch(setIsAuthenticated(false));
      dispatch(setAuthUser(null));
    });

    if (userData && userData.data) {
      dispatch(setIsAuthenticated(true));
      dispatch(setAuthUser(userData.data));
    }

    setSubmitLoader(false);



    navigate("/events");
  }



  return (

    <div className='profile-super-container'>
      <Paper className='profile-container'>

        <Formik
          enableReinitialize={true}
          initialValues={{
            ...INITIAL_FORM_STATE
          }}
          validationSchema={FORM_VALIDATION}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={handleSubmit}
        >

          <Form>
            <Grid container spacing={2} >
              <Grid item xs={12} >
              <Typography className='profile-container-heading' variant="h3">Profile</Typography>
              <hr />
              </Grid>

              <Grid item xs = {12} lg={12} >
                <Textfield name="name" label="Name"  disabled />
              </Grid>

              <Grid item xs = {12} lg={12} >
                <Textfield name="email" label="Email" disabled />
              </Grid>

              <Grid item xs = {12} lg={6} >
                {user && user.username ? <Textfield disabled name="username" label="Username" /> : <Textfield required name="username" label="Username" />}
                
              </Grid>

              <Grid item xs = {12} lg={6} >
                <Textfield  name="whatsappNumber" label="Whatsapp Number" />
              </Grid>

              <Grid item xs = {12} lg={12} >
                <Textfield required name="college" label="College" />
              </Grid>

              <Grid item xs = {12} lg={6} >
                <Textfield name="githubUsername" label="Github Username" />
              </Grid>


            </Grid>
            <div className='profile-button-container'>

              <Button variant='contained' type="submit" color="success" size="large"> Submit {submitloader ? <CircularProgress style={{ marginLeft: 8 }} size="1rem" /> : null} </Button>
              </div>
          </Form>

        </Formik>



        {/* <Typography className='profile-container-heading' variant="h3">Profile</Typography>
        <hr />
        <TextField fullWidth label="Name" value={name} margin="normal" disabled />
        <TextField fullWidth label="Email" value={email} margin="normal" disabled />
        {user && user.isRegistered ? <TextField fullWidth label="Username" value={username} margin="normal" disabled /> : <TextField required fullWidth label="Choose a Username" value={username} margin="normal" helperText="Username will not be changed, choose carefully" onChange={(e) => { setUsername(e.target.value) }} />}

        <TextField required fullWidth label="College" value={college} margin="normal" onChange={(e) => { setCollege(e.target.value) }} />
        <div className='profile-inputx2-container'>
          <TextField className='profile-inputx2' label="Whatsapp Number" value={whatsappNumber} margin="normal" onChange={(e) => { setWhatsappNumber(e.target.value) }} />
          <TextField className='profile-inputx2' label="Github Username" value={githubUsername} margin="normal" onChange={(e) => { setGithubUsername(e.target.value) }} />
        </div> */}

        

      </Paper>
    </div>
  )
}
