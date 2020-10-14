import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import userService from "../UserService/UserService";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { AppContext } from "../AppContext/AppContext";
import Spinner from "react-bootstrap/Spinner";
import { BiLogInCircle } from "react-icons/bi";
import { BsExclamationCircle } from "react-icons/bs";
import { usePromise } from "react-use-promise-matcher";
import FormikInput from "../FormikInput/FormikInput";

interface LoginParams {
  loginOrEmail: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    dispatch,
    state: { loggedIn },
  } = React.useContext(AppContext);

  const validationSchema: Yup.ObjectSchema<LoginParams | undefined> = Yup.object({
    loginOrEmail: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
  });

  const [result, send] = usePromise((values: LoginParams) =>
    userService
      .login(values)
      .then(({ apiKey }) => {
        dispatch({ type: "SET_API_KEY", apiKey });
      })
      .catch((error) => {
        if (error?.response?.status === 404) throw new Error("Incorrect login/email or password!");

        throw new Error(error?.response?.data?.error || error.message);
      })
  );

  if (loggedIn) return <Redirect to="/main" />;

  return (
    <Container className="py-5">
      <h3>Please sign in</h3>
      <Formik<LoginParams>
        initialValues={{
          loginOrEmail: "",
          password: "",
        }}
        onSubmit={send}
        validationSchema={validationSchema}
      >
        <Form as={FormikForm}>
          <FormikInput name="loginOrEmail" label="Login or email" />
          <FormikInput name="password" type="password" label="Password" />

          <Button type="submit" disabled={result.isLoading}>
            <BiLogInCircle />
            &nbsp;Sign In
          </Button>
          <Link className="btn btn-link" to="/recover-lost-password">
            Forgot password?
          </Link>

          {result.match({
            Idle: () => <></>,
            Loading: () => (
              <Form.Text muted>
                <Spinner as="span" className="mr-2" animation="border" size="sm" role="loader" />
                Connecting
              </Form.Text>
            ),
            Rejected: (error) => (
              <Form.Text className="text-danger">
                <BsExclamationCircle className="mr-2" />
                {error.toString()}
              </Form.Text>
            ),
            Resolved: () => <Redirect to="/main" />,
          })}
        </Form>
      </Formik>
    </Container>
  );
};

export default Login;
