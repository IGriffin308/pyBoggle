from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    def setUp(self):
        """Setup testing environment."""

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_html(self):
        """Checks if homepage loads correctly"""

        with self.client:
            response = self.client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))
            self.assertIn(b'<p>High Score:', response.data)
            self.assertIn(b'Score:', response.data)
            self.assertIn(b'Seconds Left:', response.data)

    def test_word_on_board(self):
        """Test if word is on board"""

        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [["N", "E", "V", "E", "R"], 
                                 ["G", "O", "N", "N", "A"], 
                                 ["G", "I", "V", "E", "E"], 
                                 ["Y", "O", "U", "U", "U"], 
                                 ["U", "P", "P", "P", "P"]]
        response = self.client.get('/check-word?word=never')
        self.assertEqual(response.json['result'], 'ok')

    def test_dictionary(self):
        """Test dictionary connection"""

        self.client.get('/')
        response = self.client.get('/check-word?word=sesquipedalianism')
        self.assertEqual(response.json['result'], 'not-on-board')

    def test_not_a_word(self):
        """Test if word is on the board"""

        self.client.get('/')
        response = self.client.get(
            '/check-word?word=fsjdakfkldsfjdslkfjdlksf')
        self.assertEqual(response.json['result'], 'not-word')