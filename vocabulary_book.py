#!/usr/bin/env python3
"""
English Vocabulary Book - Daily Learning Progress Tracker
A comprehensive system for recording and tracking English vocabulary learning.
"""

import json
import os
from datetime import datetime, date
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class DifficultyLevel(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class LearningStatus(Enum):
    NEW = "new"
    LEARNING = "learning"
    REVIEWING = "reviewing"
    MASTERED = "mastered"


@dataclass
class VocabularyWord:
    word: str
    definition: str
    pronunciation: str
    part_of_speech: str
    example_sentence: str
    difficulty: DifficultyLevel
    status: LearningStatus
    date_added: str
    last_reviewed: Optional[str] = None
    review_count: int = 0
    correct_count: int = 0
    notes: str = ""


@dataclass
class DailyProgress:
    date: str
    words_learned: int
    words_reviewed: int
    time_spent_minutes: int
    accuracy_rate: float
    new_words: List[str]
    reviewed_words: List[str]


class VocabularyBook:
    def __init__(self, data_file: str = "vocabulary_data.json"):
        self.data_file = data_file
        self.words: Dict[str, VocabularyWord] = {}
        self.daily_progress: Dict[str, DailyProgress] = {}
        self.load_data()

    def load_data(self):
        """Load vocabulary data from JSON file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Load words
                for word_data in data.get('words', []):
                    word = VocabularyWord(
                        word=word_data['word'],
                        definition=word_data['definition'],
                        pronunciation=word_data['pronunciation'],
                        part_of_speech=word_data['part_of_speech'],
                        example_sentence=word_data['example_sentence'],
                        difficulty=DifficultyLevel(word_data['difficulty']),
                        status=LearningStatus(word_data['status']),
                        date_added=word_data['date_added'],
                        last_reviewed=word_data.get('last_reviewed'),
                        review_count=word_data.get('review_count', 0),
                        correct_count=word_data.get('correct_count', 0),
                        notes=word_data.get('notes', '')
                    )
                    self.words[word.word] = word
                
                # Load daily progress
                for date_str, progress_data in data.get('daily_progress', {}).items():
                    progress = DailyProgress(
                        date=progress_data['date'],
                        words_learned=progress_data['words_learned'],
                        words_reviewed=progress_data['words_reviewed'],
                        time_spent_minutes=progress_data['time_spent_minutes'],
                        accuracy_rate=progress_data['accuracy_rate'],
                        new_words=progress_data['new_words'],
                        reviewed_words=progress_data['reviewed_words']
                    )
                    self.daily_progress[date_str] = progress
                    
            except Exception as e:
                print(f"Error loading data: {e}")

    def save_data(self):
        """Save vocabulary data to JSON file"""
        data = {
            'words': [
                {
                    'word': word.word,
                    'definition': word.definition,
                    'pronunciation': word.pronunciation,
                    'part_of_speech': word.part_of_speech,
                    'example_sentence': word.example_sentence,
                    'difficulty': word.difficulty.value,
                    'status': word.status.value,
                    'date_added': word.date_added,
                    'last_reviewed': word.last_reviewed,
                    'review_count': word.review_count,
                    'correct_count': word.correct_count,
                    'notes': word.notes
                }
                for word in self.words.values()
            ],
            'daily_progress': {
                date_str: asdict(progress)
                for date_str, progress in self.daily_progress.items()
            }
        }
        
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def add_word(self, word: str, definition: str, pronunciation: str = "",
                 part_of_speech: str = "", example_sentence: str = "",
                 difficulty: DifficultyLevel = DifficultyLevel.INTERMEDIATE,
                 notes: str = "") -> bool:
        """Add a new word to the vocabulary book"""
        if word.lower() in [w.lower() for w in self.words.keys()]:
            print(f"Word '{word}' already exists in vocabulary book.")
            return False
        
        new_word = VocabularyWord(
            word=word,
            definition=definition,
            pronunciation=pronunciation,
            part_of_speech=part_of_speech,
            example_sentence=example_sentence,
            difficulty=difficulty,
            status=LearningStatus.NEW,
            date_added=datetime.now().strftime('%Y-%m-%d'),
            notes=notes
        )
        
        self.words[word] = new_word
        self.save_data()
        return True

    def review_word(self, word: str, correct: bool = True) -> bool:
        """Mark a word as reviewed"""
        if word not in self.words:
            return False
        
        vocab_word = self.words[word]
        vocab_word.last_reviewed = datetime.now().strftime('%Y-%m-%d')
        vocab_word.review_count += 1
        
        if correct:
            vocab_word.correct_count += 1
            
            # Update status based on performance
            accuracy = vocab_word.correct_count / vocab_word.review_count
            if vocab_word.review_count >= 5 and accuracy >= 0.8:
                vocab_word.status = LearningStatus.MASTERED
            elif vocab_word.review_count >= 2:
                vocab_word.status = LearningStatus.REVIEWING
            else:
                vocab_word.status = LearningStatus.LEARNING
        
        self.save_data()
        return True

    def get_words_for_review(self, limit: int = 10) -> List[VocabularyWord]:
        """Get words that need review based on spaced repetition"""
        today = datetime.now().date()
        review_words = []
        
        for word in self.words.values():
            if word.status == LearningStatus.MASTERED:
                continue
                
            days_since_review = 0
            if word.last_reviewed:
                last_review = datetime.strptime(word.last_reviewed, '%Y-%m-%d').date()
                days_since_review = (today - last_review).days
            
            # Spaced repetition logic
            review_interval = 1
            if word.review_count >= 1:
                review_interval = min(word.review_count * 2, 30)
            
            if days_since_review >= review_interval or word.status == LearningStatus.NEW:
                review_words.append(word)
        
        return sorted(review_words, key=lambda x: x.review_count)[:limit]

    def record_daily_progress(self, words_learned: int, words_reviewed: int,
                            time_spent_minutes: int, accuracy_rate: float,
                            new_words: List[str] = None, reviewed_words: List[str] = None):
        """Record daily learning progress"""
        today = date.today().strftime('%Y-%m-%d')
        
        progress = DailyProgress(
            date=today,
            words_learned=words_learned,
            words_reviewed=words_reviewed,
            time_spent_minutes=time_spent_minutes,
            accuracy_rate=accuracy_rate,
            new_words=new_words or [],
            reviewed_words=reviewed_words or []
        )
        
        self.daily_progress[today] = progress
        self.save_data()

    def get_statistics(self) -> Dict:
        """Get learning statistics"""
        total_words = len(self.words)
        new_words = len([w for w in self.words.values() if w.status == LearningStatus.NEW])
        learning_words = len([w for w in self.words.values() if w.status == LearningStatus.LEARNING])
        reviewing_words = len([w for w in self.words.values() if w.status == LearningStatus.REVIEWING])
        mastered_words = len([w for w in self.words.values() if w.status == LearningStatus.MASTERED])
        
        # Calculate weekly progress
        week_progress = []
        total_time_week = 0
        for i in range(7):
            check_date = (datetime.now().date() - datetime.timedelta(days=i)).strftime('%Y-%m-%d')
            if check_date in self.daily_progress:
                progress = self.daily_progress[check_date]
                week_progress.append(progress)
                total_time_week += progress.time_spent_minutes
        
        avg_accuracy = sum(p.accuracy_rate for p in week_progress) / len(week_progress) if week_progress else 0
        
        return {
            'total_words': total_words,
            'new_words': new_words,
            'learning_words': learning_words,
            'reviewing_words': reviewing_words,
            'mastered_words': mastered_words,
            'mastery_rate': mastered_words / total_words if total_words > 0 else 0,
            'weekly_time_minutes': total_time_week,
            'weekly_accuracy': avg_accuracy,
            'study_streak': self.get_study_streak()
        }

    def get_study_streak(self) -> int:
        """Calculate current study streak in days"""
        streak = 0
        current_date = datetime.now().date()
        
        while True:
            date_str = current_date.strftime('%Y-%m-%d')
            if date_str in self.daily_progress:
                streak += 1
                current_date -= datetime.timedelta(days=1)
            else:
                break
        
        return streak

    def search_words(self, query: str) -> List[VocabularyWord]:
        """Search words by word, definition, or notes"""
        query = query.lower()
        results = []
        
        for word in self.words.values():
            if (query in word.word.lower() or 
                query in word.definition.lower() or 
                query in word.notes.lower()):
                results.append(word)
        
        return results

    def export_to_txt(self, filename: str = None):
        """Export vocabulary book to text file"""
        if filename is None:
            filename = f"vocabulary_export_{datetime.now().strftime('%Y%m%d')}.txt"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("ENGLISH VOCABULARY BOOK\n")
            f.write("=" * 50 + "\n\n")
            
            # Statistics
            stats = self.get_statistics()
            f.write("STATISTICS\n")
            f.write("-" * 20 + "\n")
            f.write(f"Total Words: {stats['total_words']}\n")
            f.write(f"Mastered: {stats['mastered_words']} ({stats['mastery_rate']:.1%})\n")
            f.write(f"Study Streak: {stats['study_streak']} days\n\n")
            
            # Words by status
            for status in LearningStatus:
                words_with_status = [w for w in self.words.values() if w.status == status]
                if words_with_status:
                    f.write(f"{status.value.upper()} WORDS ({len(words_with_status)})\n")
                    f.write("-" * 30 + "\n")
                    
                    for word in sorted(words_with_status, key=lambda x: x.word):
                        f.write(f"{word.word} [{word.part_of_speech}]\n")
                        f.write(f"  Definition: {word.definition}\n")
                        if word.pronunciation:
                            f.write(f"  Pronunciation: {word.pronunciation}\n")
                        if word.example_sentence:
                            f.write(f"  Example: {word.example_sentence}\n")
                        f.write(f"  Added: {word.date_added}\n")
                        f.write(f"  Reviews: {word.review_count} (Accuracy: {word.correct_count}/{word.review_count})\n")
                        if word.notes:
                            f.write(f"  Notes: {word.notes}\n")
                        f.write("\n")
                    f.write("\n")
        
        print(f"Vocabulary book exported to {filename}")


if __name__ == "__main__":
    # Example usage
    vocab_book = VocabularyBook()
    
    # Add some sample words
    vocab_book.add_word(
        "serendipity",
        "The occurrence of events by chance in a happy or beneficial way",
        "/ˌserənˈdipədē/",
        "noun",
        "Finding that old book was pure serendipity.",
        DifficultyLevel.ADVANCED,
        "From a Persian fairy tale"
    )
    
    vocab_book.add_word(
        "ephemeral",
        "Lasting for a very short time",
        "/əˈfem(ə)rəl/",
        "adjective",
        "The beauty of cherry blossoms is ephemeral.",
        DifficultyLevel.INTERMEDIATE
    )
    
    # Record some progress
    vocab_book.record_daily_progress(2, 0, 15, 1.0, ["serendipity", "ephemeral"])
    
    # Print statistics
    stats = vocab_book.get_statistics()
    print("Vocabulary Book Statistics:")
    for key, value in stats.items():
        print(f"{key}: {value}")