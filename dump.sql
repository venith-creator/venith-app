--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    price_at_time numeric,
    quantity integer DEFAULT 1,
    custom_request text,
    confirmed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    admin_reply text
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name text NOT NULL,
    quantity integer NOT NULL,
    price numeric NOT NULL,
    category text
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_read boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    category text,
    type text,
    price numeric,
    description text,
    image text,
    rating integer
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    product_id integer,
    user_name text NOT NULL,
    comment text NOT NULL,
    rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    admin_reply text,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    role character varying DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, user_id, product_id, price_at_time, quantity, custom_request, confirmed, created_at, admin_reply) FROM stdin;
41	8	1	80	1	\N	t	2025-06-18 14:32:28.325827	\N
45	8	7	100	1	\N	t	2025-06-22 02:53:02.730783	i didnt like your rating tho
46	7	4	12	5	\N	t	2025-06-22 03:07:56.810164	\N
33	6	2	45	1	\N	t	2025-06-10 14:35:02.557145	\N
34	7	2	45	1	\N	t	2025-06-10 14:36:26.88172	\N
36	9	2	45	5	\N	t	2025-06-14 04:24:56.625759	\N
37	6	5	165	1	\N	t	2025-06-16 11:17:47.218589	\N
39	7	3	150	1	\N	t	2025-06-18 09:55:03.706179	\N
35	7	5	165	1	\N	t	2025-06-10 14:51:34.625163	ok
30	6	4	12	8	need them cool ones	t	2025-06-10 11:37:43.325067	okay will get it for you
38	7	1	80	8	can i get them today	t	2025-06-18 08:59:39.457717	yeah 
43	6	1	80	1	\N	t	2025-06-22 02:10:36.878407	\N
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, name, quantity, price, category) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, receiver_id, content, created_at, is_read) FROM stdin;
33	7	8	hey	2025-06-14 03:30:15.035296	t
4	7	6	Hi! How are you?	2025-06-11 06:32:38.472429	t
6	7	6	Hi Patrick! How are you?	2025-06-11 19:21:14.954146	t
16	7	6	hey whatsup	2025-06-12 15:57:54.161558	t
17	7	6	hey	2025-06-12 16:48:53.766726	t
19	7	6	hey	2025-06-13 00:05:25.084086	t
21	7	6	hey	2025-06-13 00:05:25.083459	t
18	7	6	hey	2025-06-13 00:05:25.083764	t
20	7	6	hey	2025-06-13 00:05:27.036505	t
22	7	6	hey	2025-06-13 00:12:38.977751	t
24	7	6	hey	2025-06-13 00:14:48.30812	t
25	7	6	hey whatsup	2025-06-13 01:21:03.724283	t
26	7	6	hey	2025-06-13 02:04:48.658405	t
28	7	6	i am good bro	2025-06-13 02:10:12.689012	t
34	8	7	watsup	2025-06-14 03:56:31.225288	t
35	9	6	hey i am new	2025-06-14 04:21:38.433347	t
36	6	9	oh you are, how are you doing	2025-06-14 04:22:28.132068	f
37	6	8	hey whatsup	2025-06-16 08:39:53.395427	t
38	8	6	i am good	2025-06-16 08:40:24.836689	t
39	7	9	hey mum	2025-06-16 16:29:27.740031	f
3	6	7	Hello there	2025-06-11 06:32:38.472429	t
5	6	7	Hello from Patrick	2025-06-11 19:21:14.954146	t
14	6	7	hey	2025-06-12 15:21:20.339171	t
15	6	7	watsup	2025-06-12 15:25:58.335536	t
23	6	7	watsup how is it going?	2025-06-13 00:13:23.280947	t
27	6	7	watsup	2025-06-13 02:09:11.593708	t
29	6	7	hey whats ggood	2025-06-13 02:23:01.548863	t
30	6	7	hmm	2025-06-13 03:00:45.34334	t
31	6	7	take care	2025-06-13 03:00:57.570258	t
32	6	7	hey watsup	2025-06-14 03:28:40.62782	t
40	8	9	hey mum, i love you mum	2025-06-22 03:02:33.422188	t
41	9	8	i love you tooo	2025-06-22 03:03:25.566518	f
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, category, type, price, description, image, rating) FROM stdin;
1	Venith Sneaker	Shoes	Sneaker	80	Stylish and comfortable Venith sneaker perfect for all-day wear.	https://images.pexels.com/photos/16350687/pexels-photo-16350687/free-photo-of-shoes-and-boxes-around.jpeg	5
2	Venith Office Shirt	Shirts	Office	45	Crisp and clean shirt for your professional meetings.	https://i0.wp.com/pixahive.com/wp-content/uploads/2020/10/Mens-Formal-Shirts-131498-pixahive.jpg?fit=550%2C733&ssl=1	4
3	Venith Wristwatch - Silver	Wristwatches	Classic	150	Elegant silver wristwatch with a timeless design and reliable precision.	https://img.kwcdn.com/product/fancy/d4a4df27-2dcb-43ad-ad0d-a2e03639ae9c.jpg?imageView2/2/w/800/q/70/format/webp	5
4	Venith singlet	underwear	cotton	12	Soft and breathable cotton singlet perfect for layering or lounging.	https://img.kwcdn.com/thumbnail/s/ed3a952ee67b6977564f8984b3fb213d_e59a3b5524d6.jpg?imageView2/2/w/800/q/70/format/webp	4
5	Venith Hoodie	Shirts	Venith- mask mode	165	Warm, premium hoodie with a futuristic Venith mask-mode design.	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRlIlLCt5bOL9F222j0jrtQUn6tmXpEDC-ZQ&s	5
6	Venith office trouser	Trousers	office	89	Tailored trousers crafted for a sharp office look and comfort.	https://i.ebayimg.com/images/g/I-oAAOSwqLNlHkn2/s-l960.webp	4
7	venith office shoe	Shoes	office	100	Durable leather shoes designed for a polished office presence.	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTiG3hzglyLamzYU6zuT5F1Fj2AE045QXMJg&s	5
8	Venith Boxer	underwear	classic	45	Comfortable boxers that provide great fit and support throughout the day.	https://img.kwcdn.com/product/fancy/8017e2f2-cb86-4065-8551-054283a5b5e5.jpg?imageView2/2/w/800/q/70/format/webp	4
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, user_name, comment, rating, created_at, admin_reply) FROM stdin;
13	3	Patrick	Elegant as seen	5	2025-06-08 05:52:28.134161	\N
14	4	Patrick	yep	5	2025-06-16 15:31:44.614194	\N
15	3	pat	i loved the product	5	2025-06-18 09:55:37.482226	thanks, we will always do our best
12	4	Patrick	great	5	2025-06-08 05:51:15.539287	i am glad you loved it
16	7	peace	ok i loved the shoe	4	2025-06-22 02:54:36.973821	we are glad you loved it, why 4 tho
17	4	pat	wow too good	5	2025-06-22 03:09:58.630085	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role) FROM stdin;
8	peace	peaceaghidi010@gmail.com	$2b$10$SA17AcPvZdX4GnaSa4sWLunOz7pfe9Fi4FqRLyOSMnlM9qBzJPuuu	user
9	mum	patrickaghidi20@gmail.com	$2b$10$CVBdIe1BCptI8xTdZAyWR.zFNJwSB.uJJoSTF0wRJxBtXeOR2QMRO	user
6	Patrick	patrickaghidi222005@gmail.com	$2b$10$dMV2sAIbmxOdTmVp97h.tezpg3JZUbHpiar2F3IutJODg08h0XGiO	admin
7	pat	patrickaghidi008@gmail.com	$2b$10$DbwoWgOmwYewdp65ThCq/.B0jifxGo0ANyXj8NbyekdmrFV3TO6f.	user
\.


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 46, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 3, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 41, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 8, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

