import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 15,
    marginBottom: 25,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#4f46e5', // Primary indigo color
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerDate: { 
    fontSize: 9, 
    color: '#9ca3af', 
    textAlign: 'right', 
    marginTop: 4 
  },
  section: {
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: 18,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreText: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#374151',
    flex: 1,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    flex: 1,
    paddingRight: 10,
  },
  scoreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  tagGreat: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  tagGood: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
  },
  tagImprove: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 1.5,
  },
  feedbackText: {
    fontSize: 11,
    color: '#4f46e5',
    lineHeight: 1.5,
  }
});

const InterviewReport = ({ data }) => {
  const {
    role,
    level,
    type,
    evaluations = [],
    overallScore,
    date
  } = data || {};

  const getScoreColor = (s) => {
    if (s >= 80) return { bg: '#dcfce7', text: '#166534' };
    if (s >= 60) return { bg: '#fef3c7', text: '#b45309' };
    return { bg: '#fee2e2', text: '#991b1b' };
  };

  const getTagStyle = (scoreStr) => {
    if (scoreStr === 'great') return styles.tagGreat;
    if (scoreStr === 'good') return styles.tagGood;
    return styles.tagImprove;
  };

  const scoreColor = getScoreColor(overallScore || 0);
  const dateStr = date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SkillFusion</Text>
          </View>
          <View>
            <Text style={styles.headerSubtitle}>AI Mock Interview Report</Text>
            <Text style={styles.headerDate}>{dateStr}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{level} {role}</Text>
          <Text style={styles.subtitle}>{type} Interview Assessment</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBox, { backgroundColor: scoreColor.bg }]}>
              <Text style={[styles.scoreText, { color: scoreColor.text }]}>{overallScore || 0}%</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor.text }]}>Score</Text>
            </View>
            <Text style={styles.summaryText}>
              You completed a {evaluations.length}-question {type.toLowerCase()} interview for a {level.toLowerCase()} {role} position. 
              Overall, you achieved a score of {overallScore || 0}%.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.title, { fontSize: 16, marginBottom: 15 }]}>Detailed Review</Text>
          
          {evaluations.map((item, idx) => (
            <View key={idx} style={styles.questionCard} wrap={false}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionText}>Q{idx + 1}: {item.question}</Text>
                <View>
                  <Text style={[styles.scoreTag, getTagStyle(item.evaluation?.score)]}>
                    {item.evaluation?.score || 'N/A'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Your Answer</Text>
              <Text style={styles.answerText}>{item.answer}</Text>
              
              <Text style={styles.sectionTitle}>AI Feedback</Text>
              <Text style={styles.feedbackText}>{item.evaluation?.feedback}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default InterviewReport;
