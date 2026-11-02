import ast
import hashlib
import json
import sys
from pathlib import Path
import pytest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from klein_modern import (Context, Tool, KleinEngine, create_code, transform_code,
                          create_image, transform_image, create_video, transform_video, run_job)

TOOLS = [Tool('a', 6, (0,1,1)), Tool('b', 59, (1,0,1)), Tool('c', 28, (1,1,0))]
W = {x: 0.6 for x in ('Movement','Evolution','Being','Design','Space')}

def ctx(ids=('a','b'), **kw):
    return Context('gate:6/line:4', tuple(ids), W, **kw)

def test_core_exact_shape_and_repeat():
    e = KleinEngine(TOOLS)
    a, r = e.evaluate(ctx()); b, s = e.evaluate(ctx())
    assert a == b and r['evaluation_hash'] == s['evaluation_hash']
    assert set(a) == {'relation','intensity','direction'}
    assert len(e.ledger)==1 and r['witnessed'] and not r['possible_only']

def test_context_change_attributed():
    e = KleinEngine(TOOLS)
    _, a = e.evaluate(ctx(phase=0))
    _, b = e.evaluate(ctx(phase=1))
    assert a['evaluation_hash'] != b['evaluation_hash']
    assert a['context']['phase'] == 0 and b['context']['phase'] == 1
    assert a['result']['direction'] != b['result']['direction']

def test_joint_not_sum_of_individuals():
    e = KleinEngine(TOOLS)
    both, _ = e.evaluate(ctx(('a','b')))
    together, _ = e.evaluate(ctx(('a','b','c')))
    assert together != both
    with pytest.raises(ValueError): e.evaluate(ctx(('a','b')), ('a',))

def test_missing_context_and_invalid_axes():
    with pytest.raises(ValueError): ctx(('a',))
    with pytest.raises(ValueError): Context('x',('a','b'),{'Invented':1})
    with pytest.raises(ValueError): Tool('bad',65,(0,0,1))

def test_child_limit_and_activation():
    with pytest.raises(ValueError): Tool('p',6,(0,0,1), tuple(Tool(f'x{i}',1,(0,0,1)) for i in range(4)))
    p = Tool('p',6,(0,1,0),tuple(TOOLS[:2]))
    e = KleinEngine([p])
    assert len(e.evaluate_children('p',ctx()))==1
    with pytest.raises(ValueError): e.evaluate_children('p',Context('x',('p','c'),W))

def test_create_and_edit_code(tmp_path):
    a=tmp_path/'original.py'; b=tmp_path/'new.py'
    create_code({'name':'square_plus','args':['x','y'],'expression':'x*x + abs(y)'},a)
    original=a.read_bytes()
    transform_code(a,b,'square_plus','calculate')
    assert original==a.read_bytes() and 'def calculate(' in b.read_text()
    assert ast.parse(b.read_text())
    with pytest.raises(ValueError): create_code({'name':'oops','args':['x'],'expression':'__import__("os")'},tmp_path/'unsafe.py')

def test_image_generate_and_transform(tmp_path):
    a=tmp_path/'a.png';b=tmp_path/'b.png'
    create_image({'size':[120,80], 'shapes':[{'kind':'rectangle','coords':[10,10,70,50]}]},a)
    original=a.read_bytes()
    transform_image(a,b,[{'action':'rotate','degrees':90},{'action':'grayscale'}])
    from PIL import Image
    assert Image.open(b).size==(80,120) and a.read_bytes()==original

def test_video_generate_and_edit(tmp_path):
    a=tmp_path/'a.mp4';b=tmp_path/'b.mp4'
    create_video({'fps':5,'seconds':1,'scene':{'size':[128,96]}},a)
    original=a.read_bytes()
    transform_video(a,b,{'scale':[64,64],'grayscale':True,'seconds':0.5})
    assert a.stat().st_size>1000 and b.stat().st_size>1000 and a.read_bytes()==original

def test_job_receipts_all_media(tmp_path):
    base={'tools':[{'id':t.id,'gate':t.gate,'trigram':list(t.trigram)} for t in TOOLS[:2]],
          'context':{'address':'gate:6/line:4','active':['a','b'],'dimension_weights':W}}
    jobs=[('code',{'name':'f','args':['n'],'expression':'n+1'},'code.py'),
          ('image',{'size':[60,60]},'art.png'),
          ('video',{'fps':4,'seconds':0.5,'scene':{'size':[128,96]}},'clip.mp4')]
    for modality,operation,filename in jobs:
        job={**base,'modality':modality,'action':'create','operation':operation,'output':str(tmp_path/filename)}
        result=run_job(job)
        meta=json.loads(Path(result['manifest']).read_text())
        assert meta['output_sha256']==hashlib.sha256(Path(result['output']).read_bytes()).hexdigest()
        assert set(meta['evaluation']['result'])=={'relation','intensity','direction'}
        assert meta['original_untouched']
        with pytest.raises(FileExistsError):run_job(job)
